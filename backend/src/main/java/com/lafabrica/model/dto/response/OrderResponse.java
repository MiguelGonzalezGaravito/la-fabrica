package com.lafabrica.model.dto.response;

import com.lafabrica.model.enums.BusinessType;
import com.lafabrica.model.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private String statusLabel;
    private BusinessType businessType;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal total;
    private String shippingAddress;
    private String shippingCity;
    private String promoCode;
    private String notes;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private String paymentProofUrl;
    private PaymentProofResponse paymentProof;
    private PaymentInfoResponse paymentInfo;
    private String customerName;
    private String customerEmail;
}
