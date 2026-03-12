package com.example.thanhcongvn.dto.request.categoryNews;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data

public class CategoryNewsRequest {
    @NotBlank(message = "Tên không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    private String description;

    private Integer status = 1;
}
