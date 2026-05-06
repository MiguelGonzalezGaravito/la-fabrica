package com.lafabrica.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotNull(message = "La variante es requerida")
    private Long variantId;

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer quantity = 1;
}
