package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.CategoryNews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryNewsRepository extends JpaRepository<CategoryNews , String> {

    boolean existsBySlug(String slug);

    Optional<CategoryNews> findBySlug(String slug);
}
