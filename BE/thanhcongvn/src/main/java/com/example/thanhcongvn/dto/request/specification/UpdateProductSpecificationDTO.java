package com.example.thanhcongvn.dto.request.specification;

import lombok.Data;

@Data
public class UpdateProductSpecificationDTO {
    private String specName;
    private String specValue;
    private String groupName;
    private Integer displayOrder;
}
