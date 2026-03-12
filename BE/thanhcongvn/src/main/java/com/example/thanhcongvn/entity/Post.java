package com.example.thanhcongvn.entity;
import com.example.thanhcongvn.entity.base.PrimaryEntity;
import com.example.thanhcongvn.entity.enums.PostStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_posts_slug", columnList = "slug"),
        @Index(name = "idx_posts_status", columnList = "status"),
        @Index(name = "idx_posts_category", columnList = "id_category_new"),
        @Index(name = "idx_posts_author", columnList = "author_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post extends PrimaryEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_category_new")
    private CategoryNews category;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('draft','published','hidden') DEFAULT 'draft'")
    private PostStatus status = PostStatus.DRAFT;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


}