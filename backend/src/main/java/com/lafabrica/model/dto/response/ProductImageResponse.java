package com.lafabrica.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductImageResponse {
    private Long id;
    private String url;
    private boolean isPrimary;
    private Integer displayOrder;
}
