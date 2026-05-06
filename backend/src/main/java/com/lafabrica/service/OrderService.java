package com.lafabrica.service;

import com.lafabrica.model.dto.request.CreateOrderRequest;
import com.lafabrica.model.dto.response.*;
import com.lafabrica.model.entity.*;
import com.lafabrica.model.enums.DiscountType;
import com.lafabrica.model.enums.OrderStatus;
import com.lafabrica.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentProofRepository paymentProofRepository;
    private final CloudinaryService cloudinaryService;

    @Value("${payment.bancolombia.llave}")
    private String bancolombiLlave;

    @Value("${payment.bancolombia.titular}")
    private String bancolombiaTitular;

    @Value("${payment.bancolombia.qr-image-url}")
    private String bancolombiaQrUrl;

    private static final AtomicLong orderCounter = new AtomicLong(0);

    @Transactional
    public OrderResponse createOrder(String email, CreateOrderRequest request) {
        User user = getUser(email);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("El carrito está vacío"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;

        // Validar stock y calcular subtotal
        for (CartItem ci : cart.getItems()) {
            ProductVariant variant = ci.getVariant();
            if (variant.getStock() < ci.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + variant.getProduct().getName()
                        + " (talla " + variant.getSize() + ", color " + variant.getColor() + ")");
            }
            subtotal = subtotal.add(ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        // Aplicar promoción
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            Promotion promo = promotionRepository.findByCodeAndActiveTrue(request.getPromoCode()).orElse(null);
            if (promo != null) {
                if (promo.getMinOrderAmount() == null || subtotal.compareTo(promo.getMinOrderAmount()) >= 0) {
                    if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
                        discount = subtotal.multiply(promo.getDiscountValue())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    } else {
                        discount = promo.getDiscountValue().min(subtotal);
                    }
                }
            }
        }

        BigDecimal total = subtotal.subtract(discount);
        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(OrderStatus.PENDING_PAYMENT)
                .businessType(user.getBusinessType())
                .subtotal(subtotal)
                .discount(discount)
                .total(total)
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .notes(request.getNotes())
                .promoCode(discount.compareTo(BigDecimal.ZERO) > 0 ? request.getPromoCode() : null)
                .build();

        order = orderRepository.save(order);

        // Crear ítems y reducir stock
        for (CartItem ci : cart.getItems()) {
            ProductVariant variant = ci.getVariant();
            variant.setStock(variant.getStock() - ci.getQuantity());

            Product product = variant.getProduct();
            String imageUrl = product.getImages() != null && !product.getImages().isEmpty()
                    ? product.getImages().stream()
                        .filter(ProductImage::isPrimary).map(ProductImage::getUrl)
                        .findFirst().orElse(product.getImages().get(0).getUrl())
                    : null;

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .quantity(ci.getQuantity())
                    .unitPrice(ci.getUnitPrice())
                    .subtotal(ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .build();
            order.getItems().add(item);
        }

        // Limpiar carrito
        cart.getItems().clear();

        // Notificar al cliente
        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Pedido creado - " + orderNumber)
                .message("Tu pedido por $" + total + " fue creado. Realiza el pago a @lafabrica y sube el comprobante.")
                .build());

        return toOrderResponse(orderRepository.findById(order.getId()).orElseThrow());
    }

    public List<OrderResponse> getUserOrders(String email) {
        User user = getUser(email);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toOrderResponse).toList();
    }

    public OrderResponse getUserOrder(String email, Long orderId) {
        User user = getUser(email);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes acceso a este pedido");
        }
        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse uploadPaymentProof(String email, Long orderId, MultipartFile file) {
        User user = getUser(email);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes acceso a este pedido");
        }

        var uploaded = cloudinaryService.upload(file, "lafabrica/payments");

        PaymentProof proof = paymentProofRepository.findByOrderId(orderId).orElse(null);
        if (proof != null) {
            // Reemplazar imagen anterior en Cloudinary si existe
            if (proof.getPublicId() != null) {
                cloudinaryService.delete(proof.getPublicId());
            }
            proof.setImageUrl(uploaded.get("url"));
            proof.setPublicId(uploaded.get("publicId"));
            proof.setVerifiedAt(null);
            proof.setVerifiedByUserId(null);
        } else {
            proof = PaymentProof.builder()
                    .order(order)
                    .imageUrl(uploaded.get("url"))
                    .publicId(uploaded.get("publicId"))
                    .build();
        }
        paymentProofRepository.save(proof);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        orderRepository.save(order);

        return toOrderResponse(orderRepository.findById(orderId).orElseThrow());
    }

    // ── Admin ───────────────────────────────────────────────────────────────

    public List<OrderResponse> getAllOrders(OrderStatus status, String promoCode) {
        if (promoCode != null && !promoCode.isBlank()) {
            return orderRepository.findByPromoCodeIgnoreCase(promoCode.trim())
                    .stream().map(this::toOrderResponse).toList();
        }
        if (status != null) {
            return orderRepository.findByStatus(status).stream().map(this::toOrderResponse).toList();
        }
        return orderRepository.findAll().stream().map(this::toOrderResponse).toList();
    }

    public OrderResponse getAdminOrder(Long orderId) {
        return toOrderResponse(orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado")));
    }

    @Transactional
    public OrderResponse verifyPayment(Long orderId, Long adminId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        order.setStatus(OrderStatus.PAYMENT_VERIFIED);
        if (order.getPaymentProof() != null) {
            order.getPaymentProof().setVerifiedAt(LocalDateTime.now());
            order.getPaymentProof().setVerifiedByUserId(adminId);
        }

        notificationRepository.save(Notification.builder()
                .user(order.getUser())
                .title("Pago verificado - " + order.getOrderNumber())
                .message("Tu pago fue verificado. Estamos preparando tu pedido.")
                .build());

        return toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        order.setStatus(newStatus);

        String msg = switch (newStatus) {
            case PROCESSING -> "Tu pedido está siendo preparado.";
            case SHIPPED -> "Tu pedido ha sido enviado. Pronto llegará.";
            case DELIVERED -> "Tu pedido fue entregado. ¡Gracias por tu compra!";
            case CANCELLED -> "Tu pedido fue cancelado.";
            default -> "El estado de tu pedido fue actualizado.";
        };

        notificationRepository.save(Notification.builder()
                .user(order.getUser())
                .title("Actualización pedido - " + order.getOrderNumber())
                .message(msg)
                .build());

        return toOrderResponse(orderRepository.save(order));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private String generateOrderNumber() {
        String year = DateTimeFormatter.ofPattern("yyyy").format(LocalDateTime.now());
        long count = orderRepository.count() + 1;
        return String.format("LF-%s-%05d", year, count);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private OrderResponse toOrderResponse(Order o) {
        List<OrderItemResponse> items = o.getItems() == null ? List.of() :
                o.getItems().stream().map(i -> {
                    Product product = i.getVariant().getProduct();
                    String imgUrl = product.getImages() != null && !product.getImages().isEmpty()
                            ? product.getImages().stream().filter(ProductImage::isPrimary)
                                .map(ProductImage::getUrl).findFirst()
                                .orElse(product.getImages().get(0).getUrl())
                            : null;
                    return OrderItemResponse.builder()
                            .id(i.getId())
                            .productName(product.getName())
                            .size(i.getVariant().getSize())
                            .color(i.getVariant().getColor())
                            .imageUrl(imgUrl)
                            .quantity(i.getQuantity())
                            .unitPrice(i.getUnitPrice())
                            .subtotal(i.getSubtotal())
                            .build();
                }).toList();

        String statusLabel = switch (o.getStatus()) {
            case PENDING_PAYMENT -> "Pendiente de pago";
            case PAYMENT_VERIFIED -> "Pago verificado";
            case PROCESSING -> "En proceso";
            case SHIPPED -> "Enviado";
            case DELIVERED -> "Entregado";
            case CANCELLED -> "Cancelado";
        };

        PaymentInfoResponse paymentInfo = null;
        if (o.getStatus() == OrderStatus.PENDING_PAYMENT) {
            paymentInfo = PaymentInfoResponse.builder()
                    .orderNumber(o.getOrderNumber())
                    .totalToPay(o.getTotal())
                    .bancolombiLlave(bancolombiLlave)
                    .bancolombiaQrUrl(bancolombiaQrUrl)
                    .titular(bancolombiaTitular)
                    .banco("Bancolombia")
                    .instructions("Transfiere el valor exacto a la llave " + bancolombiLlave
                            + " o escanea el QR desde tu app bancaria. Luego sube el comprobante.")
                    .build();
        }

        PaymentProofResponse proofResponse = null;
        if (o.getPaymentProof() != null) {
            PaymentProof p = o.getPaymentProof();
            proofResponse = PaymentProofResponse.builder()
                    .id(p.getId())
                    .imageUrl(p.getImageUrl())
                    .publicId(p.getPublicId())
                    .uploadedAt(p.getUploadedAt())
                    .verifiedAt(p.getVerifiedAt())
                    .verifiedByUserId(p.getVerifiedByUserId())
                    .build();
        }

        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .statusLabel(statusLabel)
                .businessType(o.getBusinessType())
                .subtotal(o.getSubtotal())
                .discount(o.getDiscount())
                .total(o.getTotal())
                .shippingAddress(o.getShippingAddress())
                .shippingCity(o.getShippingCity())
                .promoCode(o.getPromoCode())
                .notes(o.getNotes())
                .createdAt(o.getCreatedAt())
                .items(items)
                .paymentProofUrl(proofResponse != null ? proofResponse.getImageUrl() : null)
                .paymentProof(proofResponse)
                .paymentInfo(paymentInfo)
                .customerName(o.getUser().getFirstName() + " " + o.getUser().getLastName())
                .customerEmail(o.getUser().getEmail())
                .build();
    }
}
