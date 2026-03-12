package com.example.thanhcongvn.dto.request.product;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class ProductFilterRequest {
    private String keyword;
    private String categoryId;
    private String brandId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer isActive;
}
