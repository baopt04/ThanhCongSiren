package com.example.thanhcongvn.controller.customer;

import com.example.thanhcongvn.dto.request.customer.cart.AddToCartRequest;
import com.example.thanhcongvn.dto.request.customer.cart.UpdateCartItemRequest;
import com.example.thanhcongvn.dto.response.customer.cart.CartResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.service.customer.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/cart")
@RequiredArgsConstructor
public class CustomerCartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiFeResponse<CartResponse>> getMyCart() {
        CartResponse response = cartService.getMyCart();

        return ResponseEntity.ok(
                ApiFeResponse.<CartResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/add")
    public ResponseEntity<ApiFeResponse<CartResponse>> addToCart(
            @Valid @RequestBody AddToCartRequest request) {

        CartResponse response = cartService.addToCart(request);

        return ResponseEntity.ok(
                ApiFeResponse.<CartResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/{cartDetailId}/update")
    public ResponseEntity<ApiFeResponse<CartResponse>> updateQuantity(
            @PathVariable String cartDetailId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        CartResponse response = cartService.updateQuantity(cartDetailId, request);

        return ResponseEntity.ok(
                ApiFeResponse.<CartResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/{cartDetailId}/delete")
    public ResponseEntity<ApiFeResponse<CartResponse>> removeItem(@PathVariable String cartDetailId) {
        CartResponse response = cartService.removeItem(cartDetailId);

        return ResponseEntity.ok(
                ApiFeResponse.<CartResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiFeResponse<Void>> clearCart() {
        cartService.clearCart();

        return ResponseEntity.ok(
                ApiFeResponse.<Void>builder()
                        .success(true)
                        .build()
        );
    }
}
