package com.example.thanhcongvn.dto.projection;

import java.math.BigDecimal;

/** Minimal fields for search suggest / category product cards. */
public interface ProductIdNamePriceView {
    String getId();
    String getName();
    BigDecimal getPrice();
}
