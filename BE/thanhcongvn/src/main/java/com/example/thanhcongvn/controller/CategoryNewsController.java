package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.categoryNews.CategoryNewsRequest;
import com.example.thanhcongvn.dto.response.categoryNews.CategoryNewsResponse;
import com.example.thanhcongvn.service.CategoryNewsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/category-news")
public class CategoryNewsController {
    @Autowired
    private CategoryNewsService categoryNewsService;
    @PostMapping("/create")
    public ResponseEntity<CategoryNewsResponse> create(
            @Valid @RequestBody CategoryNewsRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryNewsService.create(request));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CategoryNewsResponse> update(
            @PathVariable String id,
            @Valid @RequestBody CategoryNewsRequest request) {

        return ResponseEntity.ok(categoryNewsService.update(id, request));
    }

    @DeleteMapping("'/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {

        categoryNewsService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryNewsResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(categoryNewsService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<CategoryNewsResponse>> getAll(
            Pageable pageable) {

        return ResponseEntity.ok(categoryNewsService.getAll(pageable));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable String id) {

        categoryNewsService.toggleStatus(id);
        return ResponseEntity.ok().build();
    }
}
