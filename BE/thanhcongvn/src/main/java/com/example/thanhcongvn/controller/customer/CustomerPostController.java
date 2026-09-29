package com.example.thanhcongvn.controller.customer;

import com.example.thanhcongvn.dto.response.customer.post.ListPostCustomerResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.service.customer.CustomerPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/customer/post")
public class CustomerPostController {
    private final CustomerPostService customerPostService;
    @GetMapping
    public ResponseEntity<ApiFeResponse<Page<ListPostCustomerResponse>>> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ListPostCustomerResponse> result = customerPostService.getPublishedPosts(page, size);

        return ResponseEntity.ok(
                ApiFeResponse.<Page<ListPostCustomerResponse>>builder()
                        .success(true)
                        .data(result)
                        .build()
        );
    }
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiFeResponse<Page<ListPostCustomerResponse>>> getPublishedPostsByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ListPostCustomerResponse> result =
                customerPostService.getPublishedPostsByCategory(categoryId, page, size);

        return ResponseEntity.ok(
                ApiFeResponse.<Page<ListPostCustomerResponse>>builder()
                        .success(true)
                        .data(result)
                        .build()
        );
    }
}
