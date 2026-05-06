package com.lafabrica.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String category;
    private BigDecimal basePrice;
    private BigDecimal wholesalePrice;
    private Integer wholesaleMinQty;
    private boolean featured;
    private String primaryImageUrl;
    private boolean hasStock;
    private int totalStock;
    private boolean active;
}
