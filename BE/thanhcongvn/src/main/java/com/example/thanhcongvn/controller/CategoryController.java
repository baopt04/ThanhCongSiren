package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.category.CreateCategoryDTO;
import com.example.thanhcongvn.dto.request.category.UpdateCategoryDTO;
import com.example.thanhcongvn.dto.response.category.CategoryResponse;
import com.example.thanhcongvn.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }
    @PostMapping("/create")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryDTO createCategoryDTO) {
        CategoryResponse categoryResponse = categoryService.create(createCategoryDTO);
        return ResponseEntity.ok(categoryResponse);

    }
    @PutMapping("/update/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable String id ,
                                                   @Valid @RequestBody UpdateCategoryDTO updateCategoryDTO) {
        CategoryResponse categoryResponse = categoryService.update(id , updateCategoryDTO);
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
}
