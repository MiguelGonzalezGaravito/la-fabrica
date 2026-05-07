package com.lafabrica.service;

import com.lafabrica.model.dto.request.ProductCreateRequest;
import com.lafabrica.model.dto.request.VariantRequest;
import com.lafabrica.model.dto.response.ProductImageResponse;
import com.lafabrica.model.dto.response.ProductResponse;
import com.lafabrica.model.dto.response.ProductSummaryResponse;
import com.lafabrica.model.dto.response.VariantResponse;
import com.lafabrica.model.entity.Product;
import com.lafabrica.model.entity.ProductImage;
import com.lafabrica.model.entity.ProductVariant;
import com.lafabrica.repository.ProductImageRepository;
import com.lafabrica.repository.ProductRepository;
import com.lafabrica.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, List<MultipartFile> images) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .brand(request.getBrand())
                .category(request.getCategory())
                .basePrice(request.getBasePrice())
                .wholesalePrice(request.getWholesalePrice())
                .wholesaleMinQty(request.getWholesaleMinQty())
                .featured(request.isFeatured())
                .build();

        product = productRepository.save(product);

        if (request.getVariants() != null) {
            for (VariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(vr.getSize())
                        .color(vr.getColor())
                        .stock(vr.getStock())
                        .build();
                productVariantRepository.save(variant);
            }
        }

        if (images != null && !images.isEmpty()) {
            uploadImages(product, images);
        }

        return toProductResponse(productRepository.findById(product.getId()).orElseThrow());
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductCreateRequest request, List<MultipartFile> newImages) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setCategory(request.getCategory());
        product.setBasePrice(request.getBasePrice());
        product.setWholesalePrice(request.getWholesalePrice());
        product.setWholesaleMinQty(request.getWholesaleMinQty());
        product.setFeatured(request.isFeatured());
        productRepository.save(product);

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> existing = productVariantRepository.findByProductId(id);
            for (VariantRequest vr : request.getVariants()) {
                existing.stream()
                        .filter(v -> v.getSize().equals(vr.getSize()) && v.getColor().equals(vr.getColor()))
                        .findFirst()
                        .ifPresentOrElse(
                                v -> { v.setStock(vr.getStock()); productVariantRepository.save(v); },
                                () -> productVariantRepository.save(ProductVariant.builder()
                                        .product(product).size(vr.getSize())
                                        .color(vr.getColor()).stock(vr.getStock()).build())
                        );
            }
        }

        if (newImages != null && !newImages.isEmpty()) {
            uploadImages(product, newImages);
        }

        return toProductResponse(productRepository.findById(id).orElseThrow());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return toProductResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getProducts(String category, String brand, Pageable pageable) {
        return productRepository.findWithFilters(category, brand, pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getAdminProducts(String category, String brand, Pageable pageable) {
        return productRepository.findAllWithFilters(category, brand, pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getFeaturedProducts() {
        return productRepository.findByActiveTrueAndFeaturedTrue()
                .stream().map(this::toSummaryResponse).toList();
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        product.setActive(!product.isActive());
        productRepository.save(product);
    }

    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        if (image.getPublicId() != null) {
            cloudinaryService.delete(image.getPublicId());
        }
        productImageRepository.delete(image);
    }

    @Transactional
    public void updateVariantStock(Long variantId, Integer stock) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variante no encontrada"));
        variant.setStock(stock);
        productVariantRepository.save(variant);
    }

    private void uploadImages(Product product, List<MultipartFile> images) {
        List<ProductImage> existing = productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId());
        AtomicInteger order = new AtomicInteger(existing.size());
        boolean isFirst = existing.isEmpty();

        for (MultipartFile file : images) {
            if (file.isEmpty()) continue;
            Map<String, String> result = cloudinaryService.upload(file, "lafabrica/products");
            ProductImage img = ProductImage.builder()
                    .product(product)
                    .url(result.get("url"))
                    .publicId(result.get("publicId"))
                    .isPrimary(isFirst && order.get() == 0)
                    .displayOrder(order.getAndIncrement())
                    .build();
            productImageRepository.save(img);
            isFirst = false;
        }
    }

    private ProductResponse toProductResponse(Product p) {
        List<ProductImageResponse> images = p.getImages() == null ? new ArrayList<>() :
                p.getImages().stream().map(img -> ProductImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .isPrimary(img.isPrimary())
                        .displayOrder(img.getDisplayOrder())
                        .build()).toList();

        List<VariantResponse> variants = p.getVariants() == null ? new ArrayList<>() :
                p.getVariants().stream().map(v -> VariantResponse.builder()
                        .id(v.getId())
                        .size(v.getSize())
                        .color(v.getColor())
                        .stock(v.getStock())
                        .build()).toList();

        String primaryUrl = images.stream()
                .filter(ProductImageResponse::isPrimary)
                .map(ProductImageResponse::getUrl)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.get(0).getUrl());

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .brand(p.getBrand())
                .category(p.getCategory())
                .basePrice(p.getBasePrice())
                .wholesalePrice(p.getWholesalePrice())
                .wholesaleMinQty(p.getWholesaleMinQty())
                .active(p.isActive())
                .featured(p.isFeatured())
                .createdAt(p.getCreatedAt())
                .images(images)
                .variants(variants)
                .primaryImageUrl(primaryUrl)
                .build();
    }

    private ProductSummaryResponse toSummaryResponse(Product p) {
        String primaryUrl = p.getImages() == null ? null :
                p.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .map(ProductImage::getUrl)
                        .findFirst()
                        .orElse(p.getImages().isEmpty() ? null : p.getImages().get(0).getUrl());

        boolean hasStock = p.getVariants() != null &&
                p.getVariants().stream().anyMatch(v -> v.getStock() > 0);

        int totalStock = p.getVariants() == null ? 0 :
                p.getVariants().stream().mapToInt(v -> v.getStock() != null ? v.getStock() : 0).sum();

        return ProductSummaryResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .basePrice(p.getBasePrice())
                .wholesalePrice(p.getWholesalePrice())
                .wholesaleMinQty(p.getWholesaleMinQty())
                .featured(p.isFeatured())
                .primaryImageUrl(primaryUrl)
                .hasStock(hasStock)
                .totalStock(totalStock)
                .active(p.isActive())
                .build();
    }
}
