package com.lafabrica.repository;

import com.lafabrica.model.entity.Order;
import com.lafabrica.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByPromoCodeIgnoreCase(String promoCode);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :from")
    long countByCreatedAtAfter(@Param("from") LocalDateTime from);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.createdAt >= :from AND o.status != 'CANCELLED'")
    BigDecimal sumRevenueAfter(@Param("from") LocalDateTime from);
}
