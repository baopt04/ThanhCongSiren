package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.post.PostRequest;
import com.example.thanhcongvn.dto.response.post.PostResponse;
import com.example.thanhcongvn.entity.CategoryNews;
import com.example.thanhcongvn.entity.Post;
import com.example.thanhcongvn.entity.User;
import com.example.thanhcongvn.entity.enums.PostStatus;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.CategoryNewsRepository;
import com.example.thanhcongvn.repository.PostRepository;
import com.example.thanhcongvn.repository.UserRepository;
import com.example.thanhcongvn.service.PostService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Transactional
public class PostServiceImpl implements PostService {
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private CategoryNewsRepository categoryRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public PostResponse create(PostRequest request) {
        if (postRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.POST_SLUG);
        }

        CategoryNews category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug());
        post.setThumbnailUrl(request.getThumbnailUrl());
        post.setExcerpt(request.getExcerpt());
        post.setContent(request.getContent());
        post.setCategory(category);
        post.setAuthor(author);
        post.setStatus(request.getStatus());

        if (request.getStatus() == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }

        postRepository.save(post);

        return mapToResponse(post);
    }

    @Override
    public PostResponse update(String id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (!post.getSlug().equals(request.getSlug())
                && postRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.POST_SLUG);
        }
        CategoryNews category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug());
        post.setThumbnailUrl(request.getThumbnailUrl());
        post.setExcerpt(request.getExcerpt());
        post.setContent(request.getContent());
        post.setStatus(request.getStatus());
        post.setCategory(category);
        post.setAuthor(author);

        if (request.getStatus() == PostStatus.PUBLISHED
                && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        postRepository.save(post);
        return mapToResponse(post);
    }

    @Override
    public void delete(String id) {
        postRepository.deleteById(id);
    }

    @Override
    public PostResponse getById(String id) {
        return mapToResponse(postRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND)));
    }

    @Override
    public PostResponse getBySlug(String slug) {
        return mapToResponse(postRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND)));
    }

    @Override
    public Page<PostResponse> getAll(Pageable pageable) {
        return postRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<PostResponse> getPublished(Pageable pageable) {
        return postRepository.findByStatus(PostStatus.PUBLISHED, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<PostResponse> getByCategory(String categoryId, Pageable pageable) {
        return postRepository
                .findByStatusAndCategoryId(PostStatus.PUBLISHED, categoryId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public void changeStatus(String id, PostStatus status) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post không tồn tại"));

        post.setStatus(status);

        if (status == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
    }

    private PostResponse mapToResponse(Post post) {

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .thumbnailUrl(post.getThumbnailUrl())
                .excerpt(post.getExcerpt())
                .content(post.getContent())

                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)

                .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .authorName(post.getAuthor() != null ? post.getAuthor().getName() : null)

                .status(post.getStatus())
                .publishedAt(post.getPublishedAt())
                .build();
    }
}
