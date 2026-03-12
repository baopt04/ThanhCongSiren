package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview , String> {
}
