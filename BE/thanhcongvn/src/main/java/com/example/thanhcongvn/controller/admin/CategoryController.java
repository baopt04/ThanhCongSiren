package com.example.thanhcongvn.controller.admin;

import com.example.thanhcongvn.dto.request.category.CreateCategoryDTO;
import com.example.thanhcongvn.dto.request.category.UpdateCategoryDTO;
import com.example.thanhcongvn.dto.response.brand.BrandResponse;
import com.example.thanhcongvn.dto.response.category.CategoryResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiFeResponse<List<CategoryResponse>>> getAll(Pageable pageable) {
        Page<CategoryResponse> page = categoryService.getAll(pageable);
        PaginationResponse pagination = PaginationResponse.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();

        ApiFeResponse<List<CategoryResponse>> response = ApiFeResponse.<List<CategoryResponse>>builder()
                .success(true)
                .data(page.getContent())
                .pagination(pagination)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryDTO createCategoryDTO) {
        CategoryResponse categoryResponse = categoryService.create(createCategoryDTO);
        return ResponseEntity.ok(categoryResponse);

    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable String id,
            @Valid @RequestBody UpdateCategoryDTO updateCategoryDTO) {
        CategoryResponse categoryResponse = categoryService.update(id, updateCategoryDTO);
        return ResponseEntity.ok(categoryResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @GetMapping("/tree")
    public List<CategoryResponse> getTree() {
        return categoryService.getCategoryTree();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
