package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage , String> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(String productId);

    Optional<ProductImage> findByProductIdAndIsPrimary(String productId, Integer isPrimary);
}
