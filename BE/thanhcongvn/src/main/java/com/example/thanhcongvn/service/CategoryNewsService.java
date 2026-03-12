package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.categoryNews.CategoryNewsRequest;
import com.example.thanhcongvn.dto.response.categoryNews.CategoryNewsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryNewsService {
    CategoryNewsResponse create(CategoryNewsRequest request);

    CategoryNewsResponse update(String id, CategoryNewsRequest request);

    void delete(String id);

    CategoryNewsResponse getById(String id);

    Page<CategoryNewsResponse> getAll(Pageable pageable);

    void toggleStatus(String id);
}
