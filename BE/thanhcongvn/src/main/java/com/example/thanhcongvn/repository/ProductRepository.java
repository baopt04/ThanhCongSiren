package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product , String> {
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);
}
