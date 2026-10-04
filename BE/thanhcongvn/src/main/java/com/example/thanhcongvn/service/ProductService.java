package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.product.CreateProductDTO;
import com.example.thanhcongvn.dto.request.product.ProductFilterRequest;
import com.example.thanhcongvn.dto.request.product.UpdateProductDTO;
import com.example.thanhcongvn.dto.response.customer.product.ListProductResponse;
import com.example.thanhcongvn.dto.response.product.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface ProductService {
    ProductResponse createProduct(CreateProductDTO dto);

    ProductResponse updateProduct(String id, UpdateProductDTO dto);

    void deleteProduct(String id);

    ProductResponse getById(String id);

    Page<ProductResponse> getAll(ProductFilterRequest filter, Pageable pageable);

    void updateStock(String productId, Integer quantity);

    void updatePrice(String productId, BigDecimal price);

    void updateSalePrice(String productId, BigDecimal salePrice);

    void toggleActive(String productId);

    void toggleFeatured(String productId);
}
