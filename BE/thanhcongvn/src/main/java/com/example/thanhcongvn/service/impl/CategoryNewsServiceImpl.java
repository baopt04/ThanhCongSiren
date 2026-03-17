package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.categoryNews.CategoryNewsRequest;
import com.example.thanhcongvn.dto.response.categoryNews.CategoryNewsResponse;
import com.example.thanhcongvn.entity.CategoryNews;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.CategoryNewsRepository;
import com.example.thanhcongvn.service.CategoryNewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CategoryNewsServiceImpl implements CategoryNewsService {
    @Autowired
    private CategoryNewsRepository newsRepository;

    @Override
    public CategoryNewsResponse create(CategoryNewsRequest request) {
        if (newsRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_NEWS);
        }
        CategoryNews category = CategoryNews.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .status(request.getStatus())
                .build();

        newsRepository.save(category);

        return mapToResponse(category);
    }

    @Override
    public CategoryNewsResponse update(String id, CategoryNewsRequest request) {
        CategoryNews category = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NEWS_NOT_FOUND));

        if (!category.getSlug().equals(request.getSlug())
                && newsRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_NEWS_NOT_FOUND);
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus());
        newsRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public void delete(String id) {
        CategoryNews category = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NEWS_NOT_FOUND));

        newsRepository.delete(category);
    }

    @Override
    public CategoryNewsResponse getById(String id) {
        CategoryNews category = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NEWS_NOT_FOUND));

        return mapToResponse(category);
    }

    @Override
    public Page<CategoryNewsResponse> getAll(Pageable pageable) {
        return newsRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public void toggleStatus(String id) {

        CategoryNews category = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NEWS_NOT_FOUND));

        category.setStatus(category.getStatus() == 1 ? 0 : 1);
    }

    private CategoryNewsResponse mapToResponse(CategoryNews category) {

        return CategoryNewsResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .status(category.getStatus())
                .build();
    }
}
