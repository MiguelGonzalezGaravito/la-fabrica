package com.lafabrica.model.dto.request;

import com.lafabrica.model.enums.BusinessType;
import com.lafabrica.model.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PromotionRequest {
    @NotBlank(message = "El título es requerido")
    private String title;

    private String description;
    private String code;

    @NotNull(message = "El tipo de descuento es requerido")
    private DiscountType discountType;

    @NotNull(message = "El valor del descuento es requerido")
    @Positive(message = "El descuento debe ser mayor a 0")
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;
    private BusinessType applicableTo;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
}
