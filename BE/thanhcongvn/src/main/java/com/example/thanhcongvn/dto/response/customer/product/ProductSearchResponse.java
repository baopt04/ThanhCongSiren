package com.example.thanhcongvn.dto.response.customer.product;

import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import lombok.Builder;
import lombok.Data;

import java.awt.*;
import java.math.BigDecimal;
import java.util.List;
@Data
@Builder
public class ProductSearchResponse {
    private String id;
    private String name;
    private String slug;
    private BigDecimal price;
    private ProductImageReponse images;
}
