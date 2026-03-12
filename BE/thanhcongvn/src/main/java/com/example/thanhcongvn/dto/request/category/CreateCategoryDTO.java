package com.example.thanhcongvn.dto.request.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCategoryDTO {
    @NotBlank(message = "Tên category không được để trống")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 255)
    private String slug;

    private String parentId;

    private String description;

    @NotNull(message = "Status không được để trống")
    private Integer status;
}
