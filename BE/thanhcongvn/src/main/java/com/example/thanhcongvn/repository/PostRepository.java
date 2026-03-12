package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Post;
import com.example.thanhcongvn.entity.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post , String> {
    boolean existsBySlug(String slug);

    Optional<Post> findBySlug(String slug);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    Page<Post> findByCategoryId(String categoryId, Pageable pageable);

    Page<Post> findByStatusAndCategoryId(
            PostStatus status,
            String categoryId,
            Pageable pageable);
}
