package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.post.PostRequest;
import com.example.thanhcongvn.dto.response.post.PostResponse;
import com.example.thanhcongvn.entity.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {

    PostResponse create(PostRequest request);

    PostResponse update(String id, PostRequest request);

    void delete(String id);

    PostResponse getById(String id);

    PostResponse getBySlug(String slug);

    Page<PostResponse> getAll(Pageable pageable);

    Page<PostResponse> getPublished(Pageable pageable);

    Page<PostResponse> getByCategory(String categoryId, Pageable pageable);

    void changeStatus(String id, PostStatus status);
}
