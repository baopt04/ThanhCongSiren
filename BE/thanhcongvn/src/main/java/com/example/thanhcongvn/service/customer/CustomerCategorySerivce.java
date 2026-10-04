package com.example.thanhcongvn.service.customer;

import com.example.thanhcongvn.dto.response.customer.category.ListCategoryCustomerResponse;

import java.util.List;

public interface CustomerCategorySerivce {
    List<ListCategoryCustomerResponse> getListCategoryTree();
}
