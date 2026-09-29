package com.example.thanhcongvn.dto.response.customer.product;

import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.example.thanhcongvn.dto.response.specification.ProductSpecificationResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ProductDetailResponse {
    private String id;
    private String name;
    private String slug;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Integer isActive;
    private String description;
    private String longDescription;
    private String categoryId;
    private String categoryName;
    private String brandId;
    private String brandName;
    private List<ProductImageReponse> images;
    private Map<String , List<ProductSpecificationResponse>> specifications;

}
