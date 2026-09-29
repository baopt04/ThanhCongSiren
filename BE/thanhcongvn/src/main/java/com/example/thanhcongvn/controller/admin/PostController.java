package com.example.thanhcongvn.controller.admin;

import com.example.thanhcongvn.dto.request.post.PostRequest;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.dto.response.post.PostResponse;
import com.example.thanhcongvn.entity.enums.PostStatus;
import com.example.thanhcongvn.service.CloudinaryService;
import com.example.thanhcongvn.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/posts")
public class PostController {

    @Autowired
    private PostService postService;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/create")
    public ResponseEntity<PostResponse> create(@RequestBody PostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.create(request));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PostResponse> update(
            @PathVariable String id,
            @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        postService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(postService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiFeResponse<List<PostResponse>>> getAll(Pageable pageable) {
        Page<PostResponse> posts = postService.getAll(pageable);
        PaginationResponse pagination = PaginationResponse.builder()
                .page(posts.getNumber())
                .size(posts.getSize())
                .totalPages(posts.getTotalPages())
                .totalElements(posts.getTotalElements())
                .build();

        ApiFeResponse<List<PostResponse>> response = ApiFeResponse.<List<PostResponse>>builder()
                .success(true)
                .data(posts.getContent())
                .pagination(pagination)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/changeStatus/{id}")
    public ResponseEntity<Void> changeStatus(@PathVariable String id,
            @RequestBody PostStatus status) {
        postService.changeStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload-post-image")
    public ResponseEntity<ApiFeResponse<Map<String, String>>> uploadDescriptionImage(
            @RequestParam("file") MultipartFile file) {

        Map<String, String> result = cloudinaryService.uploadImage(file);

        return ResponseEntity.ok(
                ApiFeResponse.<Map<String, String>>builder()
                        .success(true)
                        .data(result)
                        .build());
    }

    @DeleteMapping("/delete/image-post")
    public ResponseEntity<?> deleteImage(@RequestParam("imageUrl") String imgUrl) throws Exception {
        cloudinaryService.deleteImageByImage(imgUrl);
        return ResponseEntity.ok().build();
    }
}
