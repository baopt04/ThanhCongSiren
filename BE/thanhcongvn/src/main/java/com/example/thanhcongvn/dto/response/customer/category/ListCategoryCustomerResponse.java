package com.example.thanhcongvn.dto.response.customer.category;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ListCategoryCustomerResponse {
    private String id;
    private String name;
    private String slug;
    private Integer status;
    private String description;
    private LocalDateTime createAt;
    private String parentId;
    private List<ListCategoryCustomerResponse> children;
}
