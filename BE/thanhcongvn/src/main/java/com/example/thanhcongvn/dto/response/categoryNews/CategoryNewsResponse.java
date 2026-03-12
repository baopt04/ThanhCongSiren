package com.example.thanhcongvn.dto.response.categoryNews;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@Builder
public class CategoryNewsResponse {
    private String id;
    private String name;
    private String slug;
    private String description;
    private Integer status;
}
