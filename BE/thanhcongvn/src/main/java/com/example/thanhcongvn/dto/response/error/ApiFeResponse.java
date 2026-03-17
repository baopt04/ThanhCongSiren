package com.example.thanhcongvn.dto.response.error;

import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ApiFeResponse<T> {
    private boolean success;
    private T data;
    private PaginationResponse pagination;


}
