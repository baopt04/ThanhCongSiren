package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.response.customer.product.ListProductResponse;
import com.example.thanhcongvn.dto.response.productCategory.CategoryInfo;
import com.example.thanhcongvn.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductCategoryService {
    List<CategoryInfo> getCategories(String productId);
    List<CategoryInfo> addCategories(String productId, List<String> categoryIds);
    List<CategoryInfo> replaceCategories(String productId, List<String> categoryIds);
    void removeCategory(String productId, String categoryId);
    void initCategories(Product product, List<String> extraCategoryIds);




}
