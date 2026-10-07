package com.example.thanhcongvn.dto.response.customer.product;

import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductSearchResponse {
    private String id;
    private String name;
    private String slug;
    private BigDecimal price;
    private ProductImageReponse images;
}
