package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.ProductSpecification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, String> {
    List<ProductSpecification> findByProductIdOrderByDisplayOrderAsc(String productId);

    void deleteByProductId(String productId);

    @EntityGraph(attributePaths = {"product"})
    @Query("SELECT s FROM ProductSpecification s")
    List<ProductSpecification> findAllWithProduct();
}
