package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.dto.projection.ProductCardView;
import com.example.thanhcongvn.dto.projection.ProductIdNamePriceView;
import com.example.thanhcongvn.dto.projection.ProductListView;
import com.example.thanhcongvn.dto.projection.ProductSearchView;
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

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p")
    Page<Product> findAllWithCategory(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "brand"})
    @Query("SELECT p FROM Product p")
    Page<Product> findAllWithCategoryAndBrand(Pageable pageable);

    /** Customer list — no LONGTEXT columns. */
    @Query(value = """
            SELECT p.id AS id, p.name AS name, p.price AS price,
                   c.id AS categoryId, c.name AS categoryName
            FROM Product p
            LEFT JOIN p.category c
            """,
            countQuery = "SELECT COUNT(p) FROM Product p")
    Page<ProductCardView> findAllCards(Pageable pageable);

    /** Admin list — excludes longDescription LONGTEXT. */
    @Query(value = """
            SELECT p.id AS id, p.name AS name, p.slug AS slug, p.sku AS sku,
                   p.price AS price, p.salePrice AS salePrice, p.costPrice AS costPrice,
                   p.stockQuantity AS stockQuantity, p.weight AS weight,
                   p.isActive AS isActive, p.isFeatured AS isFeatured,
                   p.description AS description, p.createdAt AS createdAt,
                   c.id AS categoryId, c.name AS categoryName,
                   b.id AS brandId, b.name AS brandName
            FROM Product p
            LEFT JOIN p.category c
            LEFT JOIN p.brand b
            """,
            countQuery = "SELECT COUNT(p) FROM Product p")
    Page<ProductListView> findAllForAdminList(Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.brand
            WHERE p.id = :idOrSlug OR p.slug = :idOrSlug
            """)
    Optional<Product> findDetailById(@Param("idOrSlug") String idOrSlug);

    @Query("""
            SELECT p.id AS id, p.name AS name, p.slug AS slug, p.price AS price
            FROM Product p
            WHERE p.isActive = 1
            AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY p.name ASC
            """)
    List<ProductSearchView> searchCardsByKeyword(@Param("keyword") String keyword, Pageable pageable);

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

    @Query(value = """
            SELECT DISTINCT p.id AS id, p.name AS name, p.price AS price,
                   c.id AS categoryId, c.name AS categoryName
            FROM Product p
            LEFT JOIN p.category c
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
    Page<ProductCardView> findCardsByCategoryIds(@Param("categoryIds") List<String> categoryIds, Pageable pageable);

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

    @Query("""
            SELECT p.id AS id, p.name AS name, p.price AS price,
                   c.id AS categoryId, c.name AS categoryName
            FROM Product p
            LEFT JOIN p.category c
            WHERE p.isActive = :isActive
              AND p.category.id IN :categoryIds
            """)
    List<ProductCardView> findCardsByCategoryIdsAndActive(
            @Param("categoryIds") List<String> categoryIds,
            @Param("isActive") Integer isActive,
            Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByCategory_IdInAndIsActive(List<String> categoryIds, Integer isActive, Pageable pageable);

    @Query(value = """
            SELECT p.id AS id, p.name AS name, p.price AS price
            FROM Product p
            WHERE p.isActive = 1
              AND EXISTS (
                SELECT 1 FROM ProductCategory pc
                WHERE pc.product = p AND pc.category.id = :categoryId
              )
            """,
            countQuery = """
                    SELECT COUNT(p) FROM Product p
                    WHERE p.isActive = 1
                      AND EXISTS (
                        SELECT 1 FROM ProductCategory pc
                        WHERE pc.product = p AND pc.category.id = :categoryId
                      )
                    """)
    Page<ProductIdNamePriceView> findActiveCardsByCategoryId(@Param("categoryId") String categoryId, Pageable pageable);

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
