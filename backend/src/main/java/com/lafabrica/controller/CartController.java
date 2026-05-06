package com.lafabrica.controller;

import com.lafabrica.model.dto.request.AddToCartRequest;
import com.lafabrica.model.dto.response.CartResponse;
import com.lafabrica.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cartService.getCart(user.getUsername()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addItem(user.getUsername(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateItem(user.getUsername(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(user.getUsername(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(@AuthenticationPrincipal UserDetails user) {
        cartService.clearCart(user.getUsername());
        return ResponseEntity.ok(Map.of("message", "Carrito vaciado"));
    }

    @PostMapping("/apply-promo")
    public ResponseEntity<CartResponse> applyPromo(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam String code) {
        return ResponseEntity.ok(cartService.applyPromo(user.getUsername(), code));
    }

    @DeleteMapping("/promo")
    public ResponseEntity<CartResponse> removePromo(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cartService.removePromo(user.getUsername()));
    }
}
