package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.post.PostRequest;
import com.example.thanhcongvn.dto.response.post.PostResponse;
import com.example.thanhcongvn.entity.enums.PostStatus;
import com.example.thanhcongvn.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
    @Autowired
    private PostService postService;

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
    public ResponseEntity<Page<PostResponse>> getAll(@PageableDefault(size = 10 ) Pageable pageable) {
        return ResponseEntity.ok(postService.getAll(pageable));
    }
    @PatchMapping("/changeStatus/{id}")
   public ResponseEntity<Void> changeStatus(@PathVariable String id ,
                                            @RequestBody PostStatus status) {
        postService.changeStatus(id, status);
        return ResponseEntity.ok().build();
    }

}
