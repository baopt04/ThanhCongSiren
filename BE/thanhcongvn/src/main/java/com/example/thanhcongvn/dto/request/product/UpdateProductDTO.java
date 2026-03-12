package com.example.thanhcongvn.dto.request.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
@Getter
@Setter
public class UpdateProductDTO {
    @NotNull(message = "Category không được để trống")
    private String categoryId;

    @NotNull(message = "Brand không được để trống")
    private String brandId;

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    @NotBlank
    private String sku;

    private String description;
    private String longDescription;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private BigDecimal salePrice;
    private BigDecimal costPrice;

    @Min(0)
    private Integer stockQuantity;

    private BigDecimal weight;
    private String thumbnailUrl;

    private Integer isActive = 1;
    private Integer isFeatured = 0;
}
