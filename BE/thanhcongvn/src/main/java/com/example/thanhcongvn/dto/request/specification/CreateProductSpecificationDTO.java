package com.example.thanhcongvn.dto.request.specification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class CreateProductSpecificationDTO {
    @NotNull
    private String productId;

    @NotBlank
    private String specName;

    @NotBlank
    private String specValue;

    private String groupName;

    private Integer displayOrder;
}
