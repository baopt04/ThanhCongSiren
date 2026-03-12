package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.response.post.PostResponse;
import com.example.thanhcongvn.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/posts")
public class PublicPostController {
    @Autowired
    private PostService postService;
    @GetMapping
    public ResponseEntity<Page<PostResponse>> getPublished(Pageable pageable) {
        return ResponseEntity.ok(postService.getPublished(pageable));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PostResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getBySlug(slug));
    }
}
