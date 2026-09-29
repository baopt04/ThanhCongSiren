package com.example.thanhcongvn.service.customer;

import com.example.thanhcongvn.dto.response.customer.category.ListCategoryCustomerReponse;

import java.util.List;

public interface CustomerCategorySerivce {
    List<ListCategoryCustomerReponse> getListCategoryTree();
}
