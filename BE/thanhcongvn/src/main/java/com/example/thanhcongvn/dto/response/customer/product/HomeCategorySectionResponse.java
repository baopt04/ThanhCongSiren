package com.example.thanhcongvn.dto.response.customer.product;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HomeCategorySectionResponse {
    private String categoryId;
    private String categoryName;
    private String categorySlug;
    private List<ListProductResponse> products;
}
