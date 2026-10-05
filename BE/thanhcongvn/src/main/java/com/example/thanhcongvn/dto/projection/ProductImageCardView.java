package com.example.thanhcongvn.dto.projection;

/** Slim image columns for product list / home / search cards. */
public interface ProductImageCardView {
    String getProductId();
    String getImageUrl();
    Integer getIsPrimary();
    Integer getDisplayOrder();
}
