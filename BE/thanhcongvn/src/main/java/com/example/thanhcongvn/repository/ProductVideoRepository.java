package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.ProductVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVideoRepository extends JpaRepository<ProductVideo , String> {
    List<ProductVideo> findByProductIdOrderByDisplayOrderAsc(String productId);
}
