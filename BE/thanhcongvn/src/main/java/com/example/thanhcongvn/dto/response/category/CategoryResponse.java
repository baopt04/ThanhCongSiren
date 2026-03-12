package com.example.thanhcongvn.dto.response.category;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private String id;
    private String name;
    private String slug;
    private Integer status;
    private String description;
    private LocalDateTime createAt;
    private String parentId;
    private List<CategoryResponse> children;
}
