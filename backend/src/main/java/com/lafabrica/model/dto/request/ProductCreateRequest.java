package com.lafabrica.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductCreateRequest {

    @NotBlank(message = "El nombre es requerido")
    private String name;

    private String description;
    private String brand;
    private String category;

    @NotNull(message = "El precio base es requerido")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal basePrice;

    private BigDecimal wholesalePrice;
    private Integer wholesaleMinQty;

    private boolean featured = false;

    @Valid
    private List<VariantRequest> variants;
}
