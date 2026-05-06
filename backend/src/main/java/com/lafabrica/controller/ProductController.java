package com.lafabrica.controller;

import com.lafabrica.model.dto.request.ProductCreateRequest;
import com.lafabrica.model.dto.response.ProductResponse;
import com.lafabrica.model.dto.response.ProductSummaryResponse;
import com.lafabrica.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ── Endpoints públicos ──────────────────────────────────────────────────

    @GetMapping("/api/products")
    public ResponseEntity<Page<ProductSummaryResponse>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(productService.getProducts(category, brand, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/api/products/featured")
    public ResponseEntity<List<ProductSummaryResponse>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/api/products/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    // ── Endpoints admin ─────────────────────────────────────────────────────

    @GetMapping("/api/admin/products")
    public ResponseEntity<Page<ProductSummaryResponse>> getAdminProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(productService.getAdminProducts(category, brand, PageRequest.of(page, size, sort)));
    }

    @PostMapping("/api/admin/products")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestPart("product") ProductCreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(productService.createProduct(request, images));
    }

    @PutMapping("/api/admin/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestPart("product") ProductCreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(productService.updateProduct(id, request, images));
    }

    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Producto desactivado correctamente"));
    }

    @DeleteMapping("/api/admin/products/{productId}/images/{imageId}")
    public ResponseEntity<Map<String, String>> deleteImage(
            @PathVariable Long productId, @PathVariable Long imageId) {
        productService.deleteImage(productId, imageId);
        return ResponseEntity.ok(Map.of("message", "Imagen eliminada correctamente"));
    }

    @PutMapping("/api/admin/products/{id}/toggle-status")
    public ResponseEntity<Map<String, String>> toggleStatus(@PathVariable Long id) {
        productService.toggleProductStatus(id);
        return ResponseEntity.ok(Map.of("message", "Estado actualizado"));
    }

    @PutMapping("/api/admin/products/variants/{variantId}/stock")
    public ResponseEntity<Map<String, String>> updateStock(
            @PathVariable Long variantId,
            @RequestParam Integer stock) {
        productService.updateVariantStock(variantId, stock);
        return ResponseEntity.ok(Map.of("message", "Stock actualizado"));
    }
}
