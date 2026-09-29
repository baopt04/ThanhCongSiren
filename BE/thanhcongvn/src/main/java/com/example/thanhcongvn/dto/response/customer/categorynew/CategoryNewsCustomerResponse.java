package com.example.thanhcongvn.dto.response.customer.categorynew;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryNewsCustomerResponse {
    private String id;
    private String name;
    private String slug;

}
