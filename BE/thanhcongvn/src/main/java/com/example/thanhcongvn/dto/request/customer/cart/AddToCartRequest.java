package com.example.thanhcongvn.dto.request.customer.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotBlank(message = "Sản phẩm không được để trống")
    private String productId;

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
}