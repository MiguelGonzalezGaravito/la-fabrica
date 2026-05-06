package com.lafabrica.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotBlank(message = "La dirección de envío es requerida")
    private String shippingAddress;

    @NotBlank(message = "La ciudad es requerida")
    private String shippingCity;

    private String notes;
    private String promoCode;
}
