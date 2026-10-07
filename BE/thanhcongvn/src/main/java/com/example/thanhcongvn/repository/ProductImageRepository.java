package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.dto.projection.ProductImageCardView;
import com.example.thanhcongvn.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, String> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(String productId);

    Optional<ProductImage> findByProductIdAndIsPrimary(String productId, Integer isPrimary);

    @Query("""
        SELECT pi FROM ProductImage pi
        WHERE pi.productId IN :productIds
        """)
    List<ProductImage> findByProductIdIn(@Param("productIds") List<String> productIds);

    /**
     * At most 2 images per product (primary first, then best hover candidate).
     * Avoids loading full galleries for list/home APIs. MySQL 8+ window functions.
     */
    @Query(value = """
            SELECT ranked.id_product AS productId,
                   ranked.image_url AS imageUrl,
                   ranked.is_primary AS isPrimary,
                   ranked.display_order AS displayOrder
            FROM (
                SELECT pi.id_product,
                       pi.image_url,
                       pi.is_primary,
                       pi.display_order,
                       ROW_NUMBER() OVER (
                           PARTITION BY pi.id_product
                           ORDER BY CASE WHEN pi.is_primary = 1 THEN 0 ELSE 1 END,
                                    COALESCE(pi.display_order, 999999) ASC
                       ) AS rn
                FROM product_images pi
                WHERE pi.id_product IN (:productIds)
            ) ranked
            WHERE ranked.rn <= 2
            """, nativeQuery = true)
    List<ProductImageCardView> findCardImagesByProductIds(@Param("productIds") List<String> productIds);

    @Query("""
        SELECT pi.productId AS productId,
               pi.imageUrl AS imageUrl,
               pi.isPrimary AS isPrimary,
               pi.displayOrder AS displayOrder
        FROM ProductImage pi
        WHERE pi.productId IN :productIds
        AND pi.isPrimary = 1
        """)
    List<ProductImageCardView> findPrimaryCardImagesByProductIds(@Param("productIds") List<String> productIds);

    @Query("""
        SELECT pi FROM ProductImage pi
        WHERE pi.productId IN :productIds
        AND pi.isPrimary = 1
        ORDER BY pi.displayOrder ASC
        """)
    List<ProductImage> findPrimaryImagesByProductIds(@Param("productIds") List<String> productIds);

    @Query("""
        SELECT i FROM ProductImage i
        WHERE i.productId IN :productIds
        """)
    List<ProductImage> findByProductIds(@Param("productIds") Collection<String> productIds);
}
