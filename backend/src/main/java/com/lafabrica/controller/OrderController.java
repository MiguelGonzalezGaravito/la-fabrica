package com.lafabrica.controller;

import com.lafabrica.model.dto.request.CreateOrderRequest;
import com.lafabrica.model.dto.response.OrderResponse;
import com.lafabrica.model.enums.OrderStatus;
import com.lafabrica.repository.UserRepository;
import com.lafabrica.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    // ── Cliente ──────────────────────────────────────────────────────────────

    @PostMapping("/api/orders")
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(user.getUsername(), request));
    }

    @GetMapping("/api/orders")
    public ResponseEntity<List<OrderResponse>> getUserOrders(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getUsername()));
    }

    @GetMapping("/api/orders/{id}")
    public ResponseEntity<OrderResponse> getUserOrder(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getUserOrder(user.getUsername(), id));
    }

    @PostMapping(value = "/api/orders/{id}/payment-proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrderResponse> uploadPaymentProof(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(orderService.uploadPaymentProof(user.getUsername(), id, file));
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    @GetMapping("/api/admin/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String promoCode) {
        return ResponseEntity.ok(orderService.getAllOrders(status, promoCode));
    }

    @GetMapping("/api/admin/orders/{id}")
    public ResponseEntity<OrderResponse> getAdminOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getAdminOrder(id));
    }

    @PutMapping("/api/admin/orders/{id}/verify-payment")
    public ResponseEntity<OrderResponse> verifyPayment(
            @AuthenticationPrincipal UserDetails adminUser,
            @PathVariable Long id) {
        Long adminId = userRepository.findByEmail(adminUser.getUsername())
                .map(u -> u.getId()).orElse(null);
        return ResponseEntity.ok(orderService.verifyPayment(id, adminId));
    }

    @PutMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}
