package com.example.thanhcongvn.dto.response.post;

import com.example.thanhcongvn.entity.enums.PostStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostResponse {
    private String title;
    private String slug;
    private String thumbnailUrl;
    private String excerpt;
    private String content;

    private String categoryId;
    private String categoryName;

    private String authorId;
    private String authorName;

    private PostStatus status;
    private LocalDateTime publishedAt;
}
