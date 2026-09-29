package com.example.thanhcongvn.dto.response.customer.category;

import com.example.thanhcongvn.dto.response.category.CategoryResponse;
import com.example.thanhcongvn.entity.Category;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ListCategoryCustomerReponse {
    private String id;
    private String name;
    private String slug;
    private Integer status;
    private String description;
    private LocalDateTime createAt;
    private String parentId;
    private List<ListCategoryCustomerReponse> children;
}
