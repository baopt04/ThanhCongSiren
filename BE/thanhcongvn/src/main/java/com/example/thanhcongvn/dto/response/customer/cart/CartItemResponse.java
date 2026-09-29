package com.example.thanhcongvn.dto.response.customer.cart;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private String id; // id của CartDetail (dùng để update/xóa)
    private String productId;
    private String productName;
    private String productImage;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer stockQuantity;
}