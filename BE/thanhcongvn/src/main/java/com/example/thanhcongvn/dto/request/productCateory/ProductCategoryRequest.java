package com.example.thanhcongvn.dto.request.productCateory;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductCategoryRequest {
    @NotNull
    private List<String> categoryIds;
}
