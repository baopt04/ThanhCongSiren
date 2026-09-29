package com.example.thanhcongvn.dto.response.customer.post;

import com.example.thanhcongvn.dto.response.customer.categorynew.CategoryNewsCustomerResponse;
import com.example.thanhcongvn.entity.CategoryNews;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ListPostCustomerResponse {
    private String id;
    private List<CategoryNewsCustomerResponse> categoryNews;
    private String title;
    private String slug;
    private String thumbnailUrl;
    private String content;
    private String status;
    private String excerpt;
    private LocalDateTime publishedAt;
}
