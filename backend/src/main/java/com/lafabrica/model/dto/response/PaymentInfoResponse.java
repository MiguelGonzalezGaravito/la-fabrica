package com.lafabrica.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentInfoResponse {
    private String orderNumber;
    private BigDecimal totalToPay;
    private String bancolombiLlave;
    private String bancolombiaQrUrl;
    private String titular;
    private String banco;
    private String instructions;
}
