package com.example.thanhcongvn.service.customer;

import com.example.thanhcongvn.dto.response.customer.category.ListCategoryCustomerReponse;
import com.example.thanhcongvn.dto.response.customer.post.ListPostCustomerResponse;
import org.springframework.data.domain.Page;

public interface CustomerPostService {
Page<ListPostCustomerResponse> getPublishedPosts(int page , int size);
Page<ListPostCustomerResponse> getPublishedPostsByCategory(String categoryId , int page , int size);
}

