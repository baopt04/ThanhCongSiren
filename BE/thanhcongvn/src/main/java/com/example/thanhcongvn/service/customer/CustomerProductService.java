package com.example.thanhcongvn.service.customer;

import com.example.thanhcongvn.dto.response.customer.product.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerProductService {
    Page<ListProductResponse> getAllProducts(Pageable pageable);

    ProductDetailResponse getProductDetailForId(String id);

    List<ProductSearchResponse> searchProducts(String keyword);

    Page<ListProductResponse> getByIdProductCategory(String slug , Pageable pageable);

    List<HomeCategorySectionResponse> getHomeCategorySection( int productLimitCategory);

    QuoteResponse createQuote(QuoteResponse quote);
}
