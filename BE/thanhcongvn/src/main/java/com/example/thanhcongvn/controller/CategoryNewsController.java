package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.categoryNews.CategoryNewsRequest;
import com.example.thanhcongvn.dto.response.categoryNews.CategoryNewsResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.service.CategoryNewsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @DeleteMapping("/delete/{id}")
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
    public ResponseEntity<ApiFeResponse<List<CategoryNewsResponse>>> getAll(
            Pageable pageable) {
            Page<CategoryNewsResponse> response = categoryNewsService.getAll(pageable);
        PaginationResponse paginationResponse = PaginationResponse.builder()
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(response.getTotalElements())
                .totalPages(response.getTotalPages())
                .build();
        ApiFeResponse<List<CategoryNewsResponse>> apiFeResponse =
                ApiFeResponse.<List<CategoryNewsResponse>>builder()
                        .success(true)
                        .data(response.getContent())
                        .pagination(paginationResponse)
                        .build();
        return ResponseEntity.ok(apiFeResponse);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable String id) {

        categoryNewsService.toggleStatus(id);
        return ResponseEntity.ok().build();
    }
}
