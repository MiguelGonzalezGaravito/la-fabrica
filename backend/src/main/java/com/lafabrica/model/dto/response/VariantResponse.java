package com.lafabrica.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VariantResponse {
    private Long id;
    private String size;
    private String color;
    private Integer stock;
}
