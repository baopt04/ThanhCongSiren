package com.example.thanhcongvn.service.impl.customer;

import com.example.thanhcongvn.dto.projection.CategoryTreeView;
import com.example.thanhcongvn.dto.response.customer.category.ListCategoryCustomerResponse;
import com.example.thanhcongvn.repository.CategoryRepository;
import com.example.thanhcongvn.service.customer.CustomerCategorySerivce;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerCategoryServiceImpl implements CustomerCategorySerivce {
    private static final long TREE_CACHE_TTL_MS = 5 * 60 * 1000L;

    private final CategoryRepository categoryRepository;

    private volatile List<ListCategoryCustomerResponse> cachedTree;
    private volatile long cachedAt;

    @Override
    @Transactional(readOnly = true)
    public List<ListCategoryCustomerResponse> getListCategoryTree() {
        long now = System.currentTimeMillis();
        List<ListCategoryCustomerResponse> snapshot = cachedTree;
        if (snapshot != null && now - cachedAt < TREE_CACHE_TTL_MS) {
            return snapshot;
        }
        synchronized (this) {
            now = System.currentTimeMillis();
            snapshot = cachedTree;
            if (snapshot != null && now - cachedAt < TREE_CACHE_TTL_MS) {
                return snapshot;
            }
            snapshot = buildTree();
            cachedTree = snapshot;
            cachedAt = now;
            return snapshot;
        }
    }

    private List<ListCategoryCustomerResponse> buildTree() {
        List<CategoryTreeView> rows = categoryRepository.findAllForTree();
        Map<String, ListCategoryCustomerResponse> byId = rows.stream()
                .collect(Collectors.toMap(
                        CategoryTreeView::getId,
                        this::mapToResponse,
                        (a, b) -> a
                ));

        List<ListCategoryCustomerResponse> roots = new ArrayList<>();
        for (CategoryTreeView row : rows) {
            ListCategoryCustomerResponse node = byId.get(row.getId());
            String parentId = row.getParentId();
            if (parentId == null) {
                roots.add(node);
            } else {
                ListCategoryCustomerResponse parent = byId.get(parentId);
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(node);
                }
            }
        }
        return roots;
    }

    private ListCategoryCustomerResponse mapToResponse(CategoryTreeView category) {
        return ListCategoryCustomerResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .status(category.getStatus())
                .parentId(category.getParentId())
                .build();
    }
}
