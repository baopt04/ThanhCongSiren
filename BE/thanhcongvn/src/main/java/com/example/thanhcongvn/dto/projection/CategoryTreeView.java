package com.example.thanhcongvn.dto.projection;

/** Category tree columns only — no description TEXT. */
public interface CategoryTreeView {
    String getId();
    String getName();
    String getSlug();
    Integer getStatus();
    String getParentId();
}
