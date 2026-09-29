package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage , String> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(String productId);

    Optional<ProductImage> findByProductIdAndIsPrimary(String productId, Integer isPrimary);
    List<ProductImage> findByProductIdIn(List<String> productIds);
    @Query("""
        SELECT pi FROM ProductImage pi
        WHERE pi.product.id IN :productIds
        AND pi.isPrimary = 1
        ORDER BY pi.displayOrder ASC
        """)
    List<ProductImage> findPrimaryImagesByProductIds(@Param("productIds") List<String> productIds);
}
