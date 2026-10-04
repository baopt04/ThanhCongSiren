package com.example.thanhcongvn.dto.projection;

import java.math.BigDecimal;

/** Minimal fields for customer product cards / home sections. */
public interface ProductCardView {
    String getId();
    String getName();
    BigDecimal getPrice();
    String getCategoryId();
    String getCategoryName();
}
