package com.lafabrica.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponse {
    private long todayOrders;
    private BigDecimal todayRevenue;
    private long weekOrders;
    private BigDecimal weekRevenue;
    private long monthOrders;
    private BigDecimal monthRevenue;
    private long totalCustomers;
    private long wholesaleCustomers;
    private long retailCustomers;
    private long pendingPaymentOrders;
    private long processingOrders;
}
