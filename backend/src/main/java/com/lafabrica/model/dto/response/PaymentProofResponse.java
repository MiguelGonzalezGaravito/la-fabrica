package com.lafabrica.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentProofResponse {
    private Long id;
    private String imageUrl;
    private String publicId;
    private LocalDateTime uploadedAt;
    private LocalDateTime verifiedAt;
    private Long verifiedByUserId;
}
