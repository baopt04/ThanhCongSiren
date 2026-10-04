package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory , String> {
    @Query("SELECT pc FROM ProductCategory pc JOIN FETCH pc.category WHERE pc.product.id = :productId")
    List<ProductCategory> findByProductIdWithCategory(@Param("productId") String productId);

    @Query("SELECT pc.category.id FROM ProductCategory pc WHERE pc.product.id = :productId")
    Set<String> findCategoryIdsByProductId(@Param("productId") String productId);

    Optional<ProductCategory> findByProductIdAndCategoryId(String productId, String categoryId);

    void deleteByProductId(String productId);

}
