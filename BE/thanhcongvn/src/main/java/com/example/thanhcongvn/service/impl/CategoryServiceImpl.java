package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.category.CreateCategoryDTO;
import com.example.thanhcongvn.dto.request.category.UpdateCategoryDTO;
import com.example.thanhcongvn.dto.response.category.CategoryResponse;
import com.example.thanhcongvn.entity.Category;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.CategoryRepository;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.service.CategoryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Override
    public Page<CategoryResponse> getAll(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(this::maptoResponse);
    }

    @Override
    public CategoryResponse create(CreateCategoryDTO createCategoryDTO) {
      if (categoryRepository.existsBySlug(createCategoryDTO.getSlug())) {
          throw new AppException(ErrorCode.CATEGORY_DUPLICATED);
      }
      Category category = Category.builder()
              .name(createCategoryDTO.getName())
              .slug(createCategoryDTO.getSlug())
              .description(createCategoryDTO.getDescription())
              .status(createCategoryDTO.getStatus())
              .build();
      if (createCategoryDTO.getParentId() != null) {
          Category parent = categoryRepository.findById(createCategoryDTO.getParentId()).orElseThrow(
                  () -> new AppException(ErrorCode.CATEGORY_PARENT_NOT_FOUND)
          );
          category.setParent(parent);
      }
      return maptoResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse update(String id, UpdateCategoryDTO updateCategoryDTO) {
        Category category = categoryRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)
        );
        if (!category.getSlug().equals(updateCategoryDTO.getSlug()) && categoryRepository.existsBySlug(updateCategoryDTO.getSlug())){
            throw new AppException(ErrorCode.CATEGORY_DUPLICATED);
        }
        category.setName(updateCategoryDTO.getName());
        category.setSlug(updateCategoryDTO.getSlug());
        category.setDescription(updateCategoryDTO.getDescription());
        category.setStatus(updateCategoryDTO.getStatus());
        if (updateCategoryDTO.getParentId() != null) {
            Category parent = categoryRepository.findById(updateCategoryDTO.getParentId()).orElseThrow(
                    () -> new AppException(ErrorCode.CATEGORY_PARENT_NOT_FOUND)
            );
            category.setParent(parent);
        }else  {
            category.setParent(null);
        }
        return maptoResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(String id) {
Category category = categoryRepository.findById(id).orElseThrow(
        () -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)
);
        if (productRepository.existsByCategoryId(id)) {
            throw new AppException(ErrorCode.CATEGORY_IN_USER);
        }
    categoryRepository.delete(category);
    }


    @Override
    public CategoryResponse getById(String id) {
        return categoryRepository.findById(id)
                .map(this::maptoResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    @Override
    public List<CategoryResponse> getCategoryTree() {
        List<Category> all = categoryRepository.findAll();
        Map<String, CategoryResponse> byId = all.stream()
                .collect(Collectors.toMap(Category::getId, this::maptoResponse));

        List<CategoryResponse> roots = new ArrayList<>();
        for (Category category : all) {
            CategoryResponse node = byId.get(category.getId());
            String parentId = category.getParent() != null ? category.getParent().getId() : null;
            if (parentId == null) {
                roots.add(node);
            } else {
                CategoryResponse parent = byId.get(parentId);
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(node);
                }
            }
        }
        return roots;
    }
    private CategoryResponse maptoResponse(Category category) {
        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setId(category.getId());
        categoryResponse.setName(category.getName());
        categoryResponse.setSlug(category.getSlug());
        categoryResponse.setStatus(category.getStatus());
        categoryResponse.setDescription(category.getDescription());
        categoryResponse.setCreateAt(category.getCreateAt());

        if (category.getParent() != null) {
            categoryResponse.setParentId(category.getParent().getId());
        }

        return categoryResponse;
    }
}
