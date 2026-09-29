package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String slug);

    List<Category> findBySlugIn(List<String> slugs);

    List<Category> findByParent_Id(String parentId);

}

