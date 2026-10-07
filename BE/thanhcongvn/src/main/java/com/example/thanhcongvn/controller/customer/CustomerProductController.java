package com.example.thanhcongvn.controller.customer;

import com.example.thanhcongvn.dto.response.customer.product.*;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.infrastructure.listener.PageResponse;
import com.example.thanhcongvn.service.impl.customer.CustomerProductServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer/product")
@RequiredArgsConstructor
public class CustomerProductController {
    private static final int MAX_PAGE_SIZE = 50;

    private final CustomerProductServiceImpl customerProductService;

    @GetMapping
    public ResponseEntity<ApiFeResponse<List<ListProductResponse>>> getAllListProduct(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ListProductResponse> page = customerProductService.getAllProducts(cap(pageable));
        return ResponseEntity.ok(wrapPage(page));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiFeResponse<ProductDetailResponse>> getProductDetailForId(@PathVariable String id) {
        ProductDetailResponse productDetail = customerProductService.getProductDetailForId(id);
        return ResponseEntity.ok(
                ApiFeResponse.<ProductDetailResponse>builder()
                        .success(true)
                        .data(productDetail)
                        .build()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiFeResponse<List<ProductSearchResponse>>> searchProducts(
            @RequestParam("keyword") String keyword) {
        List<ProductSearchResponse> result = customerProductService.searchProducts(keyword);
        return ResponseEntity.ok(
                ApiFeResponse.<List<ProductSearchResponse>>builder()
                        .success(true)
                        .data(result)
                        .build()
        );
    }

    @GetMapping("/category/{slug}")
    public ResponseEntity<ApiFeResponse<List<ListProductResponse>>> getCategoryProductSlug(
            @PathVariable String slug,
            @PageableDefault(size = 10, direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ListProductResponse> page = customerProductService.getByIdProductCategory(slug, cap(pageable));
        return ResponseEntity.ok(wrapPage(page));
    }

    @GetMapping("/home/category-sections")
    public ResponseEntity<ApiFeResponse<List<HomeCategorySectionResponse>>> getHomeCategorySections(
            @RequestParam(defaultValue = "8") int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
        List<HomeCategorySectionResponse> result = customerProductService.getHomeCategorySection(safeLimit);
        return ResponseEntity.ok(
                ApiFeResponse.<List<HomeCategorySectionResponse>>builder()
                        .success(true)
                        .data(result)
                        .build()
        );
    }

    @PostMapping("/quote")
    public ResponseEntity<ApiFeResponse<QuoteResponse>> createQuote(
            @RequestBody QuoteResponse request) {
        QuoteResponse response = customerProductService.createQuote(request);
        return ResponseEntity.ok(
                ApiFeResponse.<QuoteResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/{categoryId}/products")
    public ResponseEntity<PageResponse<ListProductResponse>> getProducts(
            @PathVariable String categoryId,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(
                customerProductService.getProductsByCategory(categoryId, cap(pageable))));
    }

    private Pageable cap(Pageable pageable) {
        if (pageable.getPageSize() <= MAX_PAGE_SIZE) {
            return pageable;
        }
        return PageRequest.of(pageable.getPageNumber(), MAX_PAGE_SIZE, pageable.getSort());
    }

    private ApiFeResponse<List<ListProductResponse>> wrapPage(Page<ListProductResponse> page) {
        PaginationResponse paginationResponse = PaginationResponse.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();
        return ApiFeResponse.<List<ListProductResponse>>builder()
                .success(true)
                .data(page.getContent())
                .pagination(paginationResponse)
                .build();
    }
}
