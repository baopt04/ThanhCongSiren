package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.category.CreateCategoryDTO;
import com.example.thanhcongvn.dto.request.category.UpdateCategoryDTO;
import com.example.thanhcongvn.dto.response.category.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAll();

    CategoryResponse create(CreateCategoryDTO createCategoryDTO);

    CategoryResponse update(String id, UpdateCategoryDTO updateCategoryDTO);

    void delete(String id);

    CategoryResponse getById(String id);

    List<CategoryResponse> getCategoryTree();
}
