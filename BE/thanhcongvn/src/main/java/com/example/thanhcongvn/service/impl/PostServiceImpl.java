package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.post.PostRequest;
import com.example.thanhcongvn.dto.response.post.PostResponse;
import com.example.thanhcongvn.entity.CategoryNews;
import com.example.thanhcongvn.entity.Post;
import com.example.thanhcongvn.entity.User;
import com.example.thanhcongvn.entity.enums.PostStatus;
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
            throw new RuntimeException("Slug đã tồn tại");
        }

        CategoryNews category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author không tồn tại"));

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
                .orElseThrow(() -> new RuntimeException("Post không tồn tại"));

        if (!post.getSlug().equals(request.getSlug())
                && postRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug đã tồn tại");
        }
        CategoryNews category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author không tồn tại"));
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
                .orElseThrow(() -> new RuntimeException("Post không tồn tại")));
    }

    @Override
    public PostResponse getBySlug(String slug) {
        return mapToResponse(postRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Post không tồn tại")));
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
                .categoryId(post.getCategory().getId())
                .categoryName(post.getCategory().getName())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getName())
                .status(post.getStatus())
                .publishedAt(post.getPublishedAt())
                .build();
    }
}
