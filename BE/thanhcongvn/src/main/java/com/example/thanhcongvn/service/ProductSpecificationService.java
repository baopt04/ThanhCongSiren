package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.specification.CreateProductSpecificationDTO;
import com.example.thanhcongvn.dto.request.specification.UpdateProductSpecificationDTO;
import com.example.thanhcongvn.dto.response.specification.ProductSpecificationResponse;

import java.util.List;

public interface ProductSpecificationService {
    ProductSpecificationResponse create(CreateProductSpecificationDTO dto);

    ProductSpecificationResponse update(String id, UpdateProductSpecificationDTO dto);

    void delete(String id);

    List<ProductSpecificationResponse> getAll();
    List<ProductSpecificationResponse> getByProductId(String productId);

    void deleteByProductId(String productId);
}
