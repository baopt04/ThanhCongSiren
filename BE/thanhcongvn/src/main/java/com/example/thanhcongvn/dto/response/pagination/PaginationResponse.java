package com.example.thanhcongvn.dto.response.pagination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginationResponse {
    private int page;
    private int size;
    private int totalPages;
    private long totalElements;
}
