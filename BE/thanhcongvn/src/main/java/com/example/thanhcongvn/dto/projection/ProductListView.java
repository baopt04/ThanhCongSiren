package com.example.thanhcongvn.dto.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Lightweight product row for list APIs — excludes description/longDescription LONGTEXT.
 */
public interface ProductListView {
    String getId();
    String getName();
    String getSlug();
    String getSku();
    BigDecimal getPrice();
    BigDecimal getSalePrice();
    BigDecimal getCostPrice();
    Integer getStockQuantity();
    BigDecimal getWeight();
    Integer getIsActive();
    Integer getIsFeatured();
    String getDescription();
    LocalDateTime getCreatedAt();
    String getCategoryId();
    String getCategoryName();
    String getBrandId();
    String getBrandName();
}
