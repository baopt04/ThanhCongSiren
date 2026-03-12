package com.example.thanhcongvn.entity;

import com.example.thanhcongvn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Table(name = "categories_news", indexes = {
        @Index(name = "idx_categories_news_slug", columnList = "slug")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryNews extends PrimaryEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TINYINT DEFAULT 1")
    private Integer status = 1;

    @OneToMany(mappedBy = "category")
    private List<Post> posts;
}
