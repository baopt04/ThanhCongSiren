package com.example.thanhcongvn.dto.request.customer.cart;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateCartItemRequest {
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
}