package com.lafabrica.model.dto.response;

import com.lafabrica.model.enums.BusinessType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal total;
    private String promoCode;
    private String promoDescription;
    private BusinessType businessType;
    private int itemCount;
}
