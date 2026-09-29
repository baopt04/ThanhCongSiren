package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductImage;
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
public interface ProductRepository extends JpaRepository<Product , String> {
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);
    boolean existsByCategoryId(String categoryId);
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.category c
        """)
    Page<Product> findAllWithCategory(Pageable pageable);
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.brand
        WHERE p.id = :id
        """)
    Optional<Product> findDetailById(@Param("id") String id);

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = 1
        AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY p.name ASC
        """)
    List<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.category
        WHERE p.category.id = :categoryId
        """)
    Page<Product> findByCategoryId(@Param("categoryId") String categoryId, Pageable pageable);


    @EntityGraph(attributePaths = {"category", "images"})
    List<Product> findByCategory_IdInAndIsActive(List<String> categoryIds, Integer isActive, Pageable pageable);


}
