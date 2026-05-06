package com.lafabrica.repository;

import com.lafabrica.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueAndFeaturedTrue();
    Page<Product> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:brand IS NULL OR p.brand = :brand)")
    Page<Product> findWithFilters(@Param("category") String category,
                                  @Param("brand") String brand,
                                  Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR p.category = :category) " +
           "AND (:brand IS NULL OR p.brand = :brand)")
    Page<Product> findAllWithFilters(@Param("category") String category,
                                     @Param("brand") String brand,
                                     Pageable pageable);
}
