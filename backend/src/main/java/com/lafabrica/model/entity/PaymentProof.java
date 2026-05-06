package com.lafabrica.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_proofs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Order order;

    @Column(nullable = false)
    private String imageUrl;

    private String publicId;

    @CreationTimestamp
    private LocalDateTime uploadedAt;

    private LocalDateTime verifiedAt;
    private Long verifiedByUserId;
}
