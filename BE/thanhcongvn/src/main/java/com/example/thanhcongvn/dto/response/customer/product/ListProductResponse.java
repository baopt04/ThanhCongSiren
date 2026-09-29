package com.example.thanhcongvn.dto.response.customer.product;

import com.example.thanhcongvn.dto.response.specification.ProductSpecificationResponse;
import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ListProductResponse {
    private String id;
    private String name;
    private BigDecimal price;
    private String categoryId;
    private String categoryName;
    private List<ProductImageReponse> image;
}
