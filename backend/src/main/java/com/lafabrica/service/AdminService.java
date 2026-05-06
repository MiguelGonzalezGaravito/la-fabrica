package com.lafabrica.service;

import com.lafabrica.model.dto.request.PromotionRequest;
import com.lafabrica.model.dto.response.DashboardResponse;
import com.lafabrica.model.entity.Notification;
import com.lafabrica.model.entity.Promotion;
import com.lafabrica.model.entity.User;
import com.lafabrica.model.enums.BusinessType;
import com.lafabrica.model.enums.OrderStatus;
import com.lafabrica.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final NotificationRepository notificationRepository;

    public DashboardResponse getDashboard() {
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);

        long totalCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("CUSTOMER")).count();
        long wholesaleCustomers = userRepository.findByBusinessType(BusinessType.WHOLESALE).stream()
                .filter(u -> u.getRole().name().equals("CUSTOMER")).count();

        return DashboardResponse.builder()
                .todayOrders(orderRepository.countByCreatedAtAfter(todayStart))
                .todayRevenue(orderRepository.sumRevenueAfter(todayStart))
                .weekOrders(orderRepository.countByCreatedAtAfter(weekStart))
                .weekRevenue(orderRepository.sumRevenueAfter(weekStart))
                .monthOrders(orderRepository.countByCreatedAtAfter(monthStart))
                .monthRevenue(orderRepository.sumRevenueAfter(monthStart))
                .totalCustomers(totalCustomers)
                .wholesaleCustomers(wholesaleCustomers)
                .retailCustomers(totalCustomers - wholesaleCustomers)
                .pendingPaymentOrders(orderRepository.findByStatus(OrderStatus.PENDING_PAYMENT).size())
                .processingOrders(orderRepository.findByStatus(OrderStatus.PROCESSING).size())
                .build();
    }

    public List<User> getCustomers(BusinessType businessType) {
        if (businessType != null) return userRepository.findByBusinessType(businessType);
        return userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("CUSTOMER")).toList();
    }

    @Transactional
    public User updateCustomerBusinessType(Long customerId, BusinessType businessType) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        user.setBusinessType(businessType);
        return userRepository.save(user);
    }

    @Transactional
    public User toggleCustomerStatus(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    public List<Promotion> getPromotions() {
        return promotionRepository.findAll();
    }

    @Transactional
    public Promotion createPromotion(PromotionRequest request) {
        Promotion promo = Promotion.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .code(request.getCode())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .applicableTo(request.getApplicableTo())
                .startDate(request.getStartDate() != null ? request.getStartDate().atStartOfDay() : null)
                .endDate(request.getEndDate() != null ? request.getEndDate().atTime(23, 59, 59) : null)
                .active(Objects.requireNonNullElse(request.getActive(), true))
                .build();
        return promotionRepository.save(promo);
    }

    @Transactional
    public Promotion updatePromotion(Long id, PromotionRequest request) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada"));
        promo.setTitle(request.getTitle());
        promo.setDescription(request.getDescription());
        promo.setCode(request.getCode());
        promo.setDiscountType(request.getDiscountType());
        promo.setDiscountValue(request.getDiscountValue());
        promo.setMinOrderAmount(request.getMinOrderAmount());
        promo.setApplicableTo(request.getApplicableTo());
        promo.setStartDate(request.getStartDate() != null ? request.getStartDate().atStartOfDay() : null);
        promo.setEndDate(request.getEndDate() != null ? request.getEndDate().atTime(23, 59, 59) : null);
        if (request.getActive() != null) promo.setActive(request.getActive());
        return promotionRepository.save(promo);
    }

    @Transactional
    public void deletePromotion(Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada"));
        promotionRepository.delete(promo);
    }

    @Transactional
    public void togglePromotion(Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada"));
        promo.setActive(!promo.isActive());
        promotionRepository.save(promo);
    }

    @Transactional
    public void notifyPromotion(Long promoId, BusinessType targetType) {
        Promotion promo = promotionRepository.findById(promoId)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada"));

        List<User> targets = targetType != null
                ? userRepository.findByBusinessType(targetType)
                : userRepository.findAll().stream()
                        .filter(u -> u.getRole().name().equals("CUSTOMER")).toList();

        for (User user : targets) {
            notificationRepository.save(Notification.builder()
                    .user(user)
                    .title("¡Promoción especial! " + promo.getTitle())
                    .message(promo.getDescription() != null ? promo.getDescription()
                            : "Usa el código " + promo.getCode() + " en tu próximo pedido.")
                    .build());
        }
    }
}
