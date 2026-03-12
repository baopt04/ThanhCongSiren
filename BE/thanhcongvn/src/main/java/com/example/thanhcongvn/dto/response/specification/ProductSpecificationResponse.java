package com.example.thanhcongvn.dto.response.specification;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductSpecificationResponse {
    private String id;
    private String productId;
    private String specName;
    private String specValue;
    private String groupName;
    private Integer displayOrder;
}
