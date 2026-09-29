package com.example.thanhcongvn.controller.customer;

import com.example.thanhcongvn.dto.response.customer.category.ListCategoryCustomerReponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.service.impl.customer.CustomerCategoryServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer/categories")
@RequiredArgsConstructor
public class CustomerCategoryController {
    private final CustomerCategoryServiceImpl customerCategoryService;
    @GetMapping("/tree")
    public ResponseEntity<ApiFeResponse<List<ListCategoryCustomerReponse>>> getAllTreeCategorys(){
        List<ListCategoryCustomerReponse> list = customerCategoryService.getListCategoryTree();
        return ResponseEntity.ok(
                ApiFeResponse.<List<ListCategoryCustomerReponse>>builder()
                        .success(true)
                        .data(list)
                        .build()
        );
    }
}
