package com.example.thanhcongvn.dto.request.post;

import com.example.thanhcongvn.entity.enums.PostStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String slug;


    private String thumbnailUrl;

    private String excerpt;

    @NotBlank
    private String content;

    private String categoryId;

    private String authorId;

    private PostStatus status = PostStatus.DRAFT;
}
