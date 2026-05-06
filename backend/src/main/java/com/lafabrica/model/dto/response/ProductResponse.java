package com.lafabrica.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String brand;
    private String category;
    private BigDecimal basePrice;
    private BigDecimal wholesalePrice;
    private Integer wholesaleMinQty;
    private boolean active;
    private boolean featured;
    private LocalDateTime createdAt;
    private List<ProductImageResponse> images;
    private List<VariantResponse> variants;
    private String primaryImageUrl;
}
