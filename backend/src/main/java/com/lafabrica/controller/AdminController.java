package com.lafabrica.controller;

import com.lafabrica.model.dto.request.PromotionRequest;
import com.lafabrica.model.dto.response.DashboardResponse;
import com.lafabrica.model.entity.Promotion;
import com.lafabrica.model.entity.User;
import com.lafabrica.model.enums.BusinessType;
import com.lafabrica.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ── Clientes ─────────────────────────────────────────────────────────────

    @GetMapping("/customers")
    public ResponseEntity<List<User>> getCustomers(
            @RequestParam(required = false) BusinessType businessType) {
        return ResponseEntity.ok(adminService.getCustomers(businessType));
    }

    @PutMapping("/customers/{id}/business-type")
    public ResponseEntity<User> updateBusinessType(
            @PathVariable Long id,
            @RequestParam BusinessType businessType) {
        return ResponseEntity.ok(adminService.updateCustomerBusinessType(id, businessType));
    }

    @PutMapping("/customers/{id}/status")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleCustomerStatus(id));
    }

    // ── Promociones ───────────────────────────────────────────────────────────

    @GetMapping("/promotions")
    public ResponseEntity<List<Promotion>> getPromotions() {
        return ResponseEntity.ok(adminService.getPromotions());
    }

    @PostMapping("/promotions")
    public ResponseEntity<Promotion> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(adminService.createPromotion(request));
    }

    @PutMapping("/promotions/{id}")
    public ResponseEntity<Promotion> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(adminService.updatePromotion(id, request));
    }

    @PutMapping("/promotions/{id}/toggle")
    public ResponseEntity<Map<String, String>> togglePromotion(@PathVariable Long id) {
        adminService.togglePromotion(id);
        return ResponseEntity.ok(Map.of("message", "Estado actualizado"));
    }

    @DeleteMapping("/promotions/{id}")
    public ResponseEntity<Map<String, String>> deletePromotion(@PathVariable Long id) {
        adminService.deletePromotion(id);
        return ResponseEntity.ok(Map.of("message", "Promoción eliminada"));
    }

    @PostMapping("/promotions/{id}/notify")
    public ResponseEntity<Map<String, String>> notifyPromotion(
            @PathVariable Long id,
            @RequestParam(required = false) BusinessType targetType) {
        adminService.notifyPromotion(id, targetType);
        return ResponseEntity.ok(Map.of("message", "Notificaciones enviadas"));
    }
}
