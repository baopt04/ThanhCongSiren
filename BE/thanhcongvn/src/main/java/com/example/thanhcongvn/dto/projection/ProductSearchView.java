package com.example.thanhcongvn.dto.projection;

import java.math.BigDecimal;

/** Search suggest row — includes slug for FE routing without extra query. */
public interface ProductSearchView {
    String getId();
    String getName();
    String getSlug();
    BigDecimal getPrice();
}
