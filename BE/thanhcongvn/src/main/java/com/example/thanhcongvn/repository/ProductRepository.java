package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    boolean existsBySlug(String slug);

    boolean existsBySku(String sku);

    boolean existsByCategoryId(String categoryId);

    /**
     * Page query without JOIN FETCH (avoids Hibernate pagination-with-fetch pitfalls).
     * Category is loaded via EntityGraph (ManyToOne).
     */
    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p")
    Page<Product> findAllWithCategory(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "brand"})
    @Query("SELECT p FROM Product p")
    Page<Product> findAllWithCategoryAndBrand(Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.brand
            WHERE p.id = :idOrSlug OR p.slug = :idOrSlug
            """)
    Optional<Product> findDetailById(@Param("idOrSlug") String idOrSlug);

    @Query("""
            SELECT p FROM Product p
            WHERE p.isActive = 1
            AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY p.name ASC
            """)
    List<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    @Query(value = """
            SELECT DISTINCT p FROM Product p
            LEFT JOIN ProductCategory pc ON pc.product.id = p.id
            WHERE (p.category.id = :categoryId OR pc.category.id = :categoryId)
            AND p.isActive = 1
            """,
            countQuery = """
                    SELECT COUNT(DISTINCT p) FROM Product p
                    LEFT JOIN ProductCategory pc ON pc.product.id = p.id
                    WHERE (p.category.id = :categoryId OR pc.category.id = :categoryId)
                    AND p.isActive = 1
                    """)
    Page<Product> findByCategoryId(@Param("categoryId") String categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    @Query(value = """
            SELECT DISTINCT p FROM Product p
            LEFT JOIN ProductCategory pc ON pc.product.id = p.id
            WHERE (p.category.id IN :categoryIds OR pc.category.id IN :categoryIds)
            AND p.isActive = 1
            """,
            countQuery = """
                    SELECT COUNT(DISTINCT p) FROM Product p
                    LEFT JOIN ProductCategory pc ON pc.product.id = p.id
                    WHERE (p.category.id IN :categoryIds OR pc.category.id IN :categoryIds)
                    AND p.isActive = 1
                    """)
    Page<Product> findByCategoryIds(@Param("categoryIds") List<String> categoryIds, Pageable pageable);

    /** List for home sections — category only; images loaded in batch separately. */
    @EntityGraph(attributePaths = {"category"})
    List<Product> findByCategory_IdInAndIsActive(List<String> categoryIds, Integer isActive, Pageable pageable);

    @Query("""
                SELECT p FROM Product p
                WHERE p.isActive = 1
                  AND EXISTS (
                    SELECT 1 FROM ProductCategory pc
                    WHERE pc.product = p AND pc.category.id = :categoryId
                  )
            """)
    Page<Product> findActiveByCategoryId(@Param("categoryId") String categoryId, Pageable pageable);

}
