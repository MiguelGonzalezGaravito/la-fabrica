package com.lafabrica.repository;

import com.lafabrica.model.entity.PaymentProof;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentProofRepository extends JpaRepository<PaymentProof, Long> {
    Optional<PaymentProof> findByOrderId(Long orderId);
}
