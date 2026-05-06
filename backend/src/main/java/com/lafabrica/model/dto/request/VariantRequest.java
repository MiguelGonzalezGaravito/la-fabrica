package com.lafabrica.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VariantRequest {
    @NotBlank(message = "La talla es requerida")
    private String size;

    @NotBlank(message = "El color es requerido")
    private String color;

    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock = 0;
}
