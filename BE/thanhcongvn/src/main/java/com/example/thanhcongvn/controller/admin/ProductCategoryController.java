package com.example.thanhcongvn.controller.admin;

import com.example.thanhcongvn.dto.request.productCateory.ProductCategoryRequest;
import com.example.thanhcongvn.dto.response.customer.product.ListProductResponse;
import com.example.thanhcongvn.dto.response.error.ApiResponse;
import com.example.thanhcongvn.dto.response.productCategory.CategoryInfo;
import com.example.thanhcongvn.infrastructure.listener.PageResponse;
import com.example.thanhcongvn.service.ProductCategoryService;
import com.example.thanhcongvn.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/product/{productId}/categories")
@RequiredArgsConstructor
public class ProductCategoryController {
    private final ProductCategoryService productCategoryService;

    @GetMapping
    public ResponseEntity<List<CategoryInfo>> getCategories(@PathVariable String productId) {
        return ResponseEntity.ok(productCategoryService.getCategories(productId));
    }

    @PostMapping
    public ResponseEntity<List<CategoryInfo>> addCategories(
            @PathVariable String productId,
            @Valid @RequestBody ProductCategoryRequest request) {
        return ResponseEntity.ok(productCategoryService.addCategories(productId, request.getCategoryIds()));
    }

    @PutMapping
    public ResponseEntity<List<CategoryInfo>> replaceCategories(
            @PathVariable String productId,
            @Valid @RequestBody ProductCategoryRequest request) {
        return ResponseEntity.ok(productCategoryService.replaceCategories(productId, request.getCategoryIds()));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> removeCategory(
            @PathVariable String productId,
            @PathVariable String categoryId) {
        productCategoryService.removeCategory(productId, categoryId);
        return ResponseEntity.noContent().build();
    }

}
