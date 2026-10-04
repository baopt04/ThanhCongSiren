package com.example.thanhcongvn.infrastructure.listener;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
public class PageResponse<T> {
    private List<T> data;
    private String message;
    private Pagination pagination;

    @Data
    @Builder
    public static class Pagination {
        private int page;
        private int size;
        private int totalPages;
        private long totalElements;
    }

    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .data(page.getContent())
                .message(null)
                .pagination(Pagination.builder()
                        .page(page.getNumber())
                        .size(page.getSize())
                        .totalPages(page.getTotalPages())
                        .totalElements(page.getTotalElements())
                        .build())
                .build();
    }
}