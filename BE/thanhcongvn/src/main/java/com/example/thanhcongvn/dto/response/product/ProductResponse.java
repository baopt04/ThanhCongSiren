package com.example.thanhcongvn.dto.response.product;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private String id;
    private String name;
    private String slug;
    private String sku;
    private BigDecimal price;
    private BigDecimal salePrice;

    private Integer stockQuantity;
    private Integer isActive;
    private Integer isFeatured;
    private String description;
    private String longDescription;
    private BigDecimal costPrice;
    private BigDecimal weight;

    private String categoryId;
    private String categoryName;
    private String brandId;
    private String brandName;

    private LocalDateTime createdAt;
}
