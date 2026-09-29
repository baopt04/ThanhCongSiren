package com.example.thanhcongvn.service.customer;

import com.example.thanhcongvn.dto.request.customer.cart.AddToCartRequest;
import com.example.thanhcongvn.dto.request.customer.cart.UpdateCartItemRequest;
import com.example.thanhcongvn.dto.response.customer.cart.CartResponse;

public interface CartService {
    CartResponse getMyCart();
    CartResponse addToCart(AddToCartRequest request);
    CartResponse updateQuantity(String cartDetailId, UpdateCartItemRequest request);
    CartResponse removeItem(String cartDetailId);
    void clearCart();
}
