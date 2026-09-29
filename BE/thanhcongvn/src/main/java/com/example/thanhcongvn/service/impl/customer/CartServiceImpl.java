package com.example.thanhcongvn.service.impl.customer;

import com.example.thanhcongvn.dto.request.customer.cart.AddToCartRequest;
import com.example.thanhcongvn.dto.request.customer.cart.UpdateCartItemRequest;
import com.example.thanhcongvn.dto.response.customer.cart.CartItemResponse;
import com.example.thanhcongvn.dto.response.customer.cart.CartResponse;
import com.example.thanhcongvn.entity.Cart;
import com.example.thanhcongvn.entity.CartDetail;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.User;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.CartDetailRepository;
import com.example.thanhcongvn.repository.CartRepository;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.repository.UserRepository;
import com.example.thanhcongvn.service.customer.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponse getMyCart() {
        Cart cart = getOrCreateCart();
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        Cart cart = getOrCreateCart();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        int quantityToAdd = request.getQuantity() != null ? request.getQuantity() : 1;

        // Nếu sản phẩm đã có trong giỏ -> cộng dồn số lượng
        Optional<CartDetail> existingItem = cartDetailRepository
                .findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartDetail item = existingItem.get();
            int newQuantity = item.getQuantity() + quantityToAdd;

            if (product.getStockQuantity() < newQuantity) {
                throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }

            item.setQuantity(newQuantity);
            cartDetailRepository.save(item);
        } else {
            if (product.getStockQuantity() < quantityToAdd) {
                throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }

            BigDecimal unitPrice = product.getSalePrice() != null
                    && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0
                    ? product.getSalePrice()
                    : product.getPrice();

            CartDetail newItem = CartDetail.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantityToAdd)
                    .unitPrice(unitPrice)
                    .build();

            cartDetailRepository.save(newItem);
        }

        return mapToResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(String cartDetailId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart();

        CartDetail item = cartDetailRepository.findById(cartDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        // Đảm bảo item này thuộc đúng giỏ hàng của user hiện tại (chống sửa giỏ người khác)
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        if (item.getProduct().getStockQuantity() < request.getQuantity()) {
            throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }

        item.setQuantity(request.getQuantity());
        cartDetailRepository.save(item);

        return mapToResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public CartResponse removeItem(String cartDetailId) {
        Cart cart = getOrCreateCart();

        CartDetail item = cartDetailRepository.findById(cartDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        cartDetailRepository.delete(item);

        return mapToResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public void clearCart() {
        Cart cart = getOrCreateCart();
        cartDetailRepository.deleteAll(cart.getCartDetails());
    }

    // Lấy giỏ hàng hiện có, hoặc tự tạo mới nếu user chưa từng có giỏ hàng
    private Cart getOrCreateCart() {
        User currentUser = getCurrentUser();

        return cartRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(currentUser)
                            .build();
                    return cartRepository.save(newCart);
                });
    }
    private User getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    private CartResponse mapToResponse(Cart cart) {
        List<CartDetail> details = cartDetailRepository.findByCartId(cart.getId());

        List<CartItemResponse> items = details.stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalQuantity = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalAmount(totalAmount)
                .totalQuantity(totalQuantity)
                .build();
    }
    private CartItemResponse mapToItemResponse(CartDetail item) {
        Product product = item.getProduct();

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .stockQuantity(product.getStockQuantity())
                .build();
    }
}
