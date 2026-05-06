package com.lafabrica.service;

import com.lafabrica.model.dto.request.AddToCartRequest;
import com.lafabrica.model.dto.response.CartItemResponse;
import com.lafabrica.model.dto.response.CartResponse;
import com.lafabrica.model.entity.*;
import com.lafabrica.model.enums.BusinessType;
import com.lafabrica.model.enums.DiscountType;
import com.lafabrica.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;

    @Transactional
    public CartResponse getCart(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        return toCartResponse(cart, user.getBusinessType(), null, null);
    }

    @Transactional
    public CartResponse removePromo(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        cart.setPromoCode(null);
        cart = cartRepository.save(cart);
        return toCartResponse(cart, user.getBusinessType(), null, null);
    }

    @Transactional
    public CartResponse addItem(String email, AddToCartRequest request) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variante no encontrada"));

        if (variant.getStock() < request.getQuantity()) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + variant.getStock());
        }

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getVariant().getId().equals(variant.getId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (variant.getStock() < newQty) {
                int canAdd = variant.getStock() - item.getQuantity();
                throw new RuntimeException(
                    canAdd <= 0
                        ? "Ya tienes el máximo disponible en el carrito (" + variant.getStock() + " unidades)"
                        : "Ya tienes " + item.getQuantity() + " en el carrito. Solo puedes agregar " + canAdd + " más"
                );
            }
            item.setQuantity(newQty);
            item.setUnitPrice(calculatePrice(variant.getProduct(), newQty, user.getBusinessType()));
        } else {
            BigDecimal price = calculatePrice(variant.getProduct(), request.getQuantity(), user.getBusinessType());
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .unitPrice(price)
                    .build();
            cart.getItems().add(item);
        }

        return toCartResponse(cart, user.getBusinessType(), null, null);
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, Integer quantity) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado en el carrito"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (item.getVariant().getStock() < quantity) {
                throw new RuntimeException("Stock insuficiente");
            }
            item.setQuantity(quantity);
            item.setUnitPrice(calculatePrice(item.getVariant().getProduct(), quantity, user.getBusinessType()));
        }

        return toCartResponse(cart, user.getBusinessType(), null, null);
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        return toCartResponse(cart, user.getBusinessType(), null, null);
    }

    @Transactional
    public CartResponse clearCart(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cart.setPromoCode(null);
        return toCartResponse(cart, user.getBusinessType(), null, null);
    }

    @Transactional
    public CartResponse applyPromo(String email, String code) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        Promotion promo = promotionRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Código promocional inválido o expirado"));

        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            throw new RuntimeException("Esta promoción aún no está activa");
        }
        if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
            throw new RuntimeException("Esta promoción ha expirado");
        }
        if (promo.getApplicableTo() != null && promo.getApplicableTo() != user.getBusinessType()) {
            throw new RuntimeException("Esta promoción no aplica para tu tipo de cuenta");
        }

        cart.setPromoCode(code);
        cartRepository.save(cart);

        return toCartResponse(cart, user.getBusinessType(), promo, code);
    }

    private BigDecimal calculatePrice(Product product, int quantity, BusinessType businessType) {
        if (businessType == BusinessType.WHOLESALE
                && product.getWholesalePrice() != null
                && product.getWholesaleMinQty() != null
                && quantity >= product.getWholesaleMinQty()) {
            return product.getWholesalePrice();
        }
        return product.getBasePrice();
    }

    private CartResponse toCartResponse(Cart cart, BusinessType businessType, Promotion promo, String promoCode) {
        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem ci : cart.getItems()) {
            Product product = ci.getVariant().getProduct();
            BigDecimal unitPrice = calculatePrice(product, ci.getQuantity(), businessType);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            String imageUrl = product.getImages() != null && !product.getImages().isEmpty()
                    ? product.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .map(ProductImage::getUrl)
                        .findFirst()
                        .orElse(product.getImages().get(0).getUrl())
                    : null;

            boolean isWholesalePrice = businessType == BusinessType.WHOLESALE
                    && product.getWholesalePrice() != null
                    && product.getWholesaleMinQty() != null
                    && ci.getQuantity() >= product.getWholesaleMinQty();

            items.add(CartItemResponse.builder()
                    .id(ci.getId())
                    .variantId(ci.getVariant().getId())
                    .productName(product.getName())
                    .size(ci.getVariant().getSize())
                    .color(ci.getVariant().getColor())
                    .imageUrl(imageUrl)
                    .quantity(ci.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .wholesalePrice(isWholesalePrice)
                    .build());
        }

        BigDecimal discount = BigDecimal.ZERO;
        String promoDesc = null;

        if (promo != null) {
            if (promo.getMinOrderAmount() == null || subtotal.compareTo(promo.getMinOrderAmount()) >= 0) {
                if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
                    discount = subtotal.multiply(promo.getDiscountValue())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                } else {
                    discount = promo.getDiscountValue().min(subtotal);
                }
                promoDesc = promo.getTitle();
            }
        }

        BigDecimal total = subtotal.subtract(discount);

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .subtotal(subtotal)
                .discount(discount)
                .total(total)
                .promoCode(promoCode)
                .promoDescription(promoDesc)
                .businessType(businessType)
                .itemCount(items.stream().mapToInt(CartItemResponse::getQuantity).sum())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }
}
