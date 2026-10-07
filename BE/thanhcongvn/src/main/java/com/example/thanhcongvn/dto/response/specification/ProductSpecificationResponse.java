package com.example.thanhcongvn.dto.response.specification;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductSpecificationResponse {
    private String id;
    private String productId;
    private String specName;
    private String specValue;
    private String groupName;
    private Integer displayOrder;
}
