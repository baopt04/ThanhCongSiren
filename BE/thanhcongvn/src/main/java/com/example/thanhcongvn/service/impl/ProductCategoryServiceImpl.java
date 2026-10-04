package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.response.customer.product.ListProductResponse;
import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.example.thanhcongvn.dto.response.productCategory.CategoryInfo;
import com.example.thanhcongvn.entity.Category;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductCategory;
import com.example.thanhcongvn.repository.CategoryRepository;
import com.example.thanhcongvn.repository.ProductCategoryRepository;
import com.example.thanhcongvn.repository.ProductImageRepository;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.service.ProductCategoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements ProductCategoryService {
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional
    public List<CategoryInfo> getCategories(String productId) {
        getProductOrThrow(productId);
        return productCategoryRepository.findByProductIdWithCategory(productId).stream()
                .map(pc -> new CategoryInfo(pc.getCategory().getId(), pc.getCategory().getName()))
                .toList();
    }

    @Override
    @Transactional
    public List<CategoryInfo> addCategories(String productId, List<String> categoryIds) {
        Product product = getProductOrThrow(productId);
        Set<String> requested = new HashSet<>(categoryIds);
        Set<String> existing = productCategoryRepository.findCategoryIdsByProductId(productId);

        Set<String> toAdd = new HashSet<>(requested);
        toAdd.removeAll(existing); // bỏ qua danh mục đã gắn, tránh trùng

        saveNew(product, toAdd);
        return getCategories(productId);
    }

    @Override
    public List<CategoryInfo> replaceCategories(String productId, List<String> categoryIds) {
        Product product = getProductOrThrow(productId);

        Set<String> target = new HashSet<>(categoryIds);
        if (product.getCategory() != null) {
            target.add(product.getCategory().getId()); // luôn giữ danh mục chính
        }

        Set<String> existing = productCategoryRepository.findCategoryIdsByProductId(productId);

        Set<String> toRemove = new HashSet<>(existing);
        toRemove.removeAll(target);

        Set<String> toAdd = new HashSet<>(target);
        toAdd.removeAll(existing);

        // Xóa trước, thêm sau
        for (String categoryId : toRemove) {
            productCategoryRepository.findByProductIdAndCategoryId(productId, categoryId)
                    .ifPresent(productCategoryRepository::delete);
        }
        productCategoryRepository.flush();

        saveNew(product, toAdd);
        return getCategories(productId);
    }

    @Override
    public void removeCategory(String productId, String categoryId) {
        Product product = getProductOrThrow(productId);

        if (product.getCategory() != null && product.getCategory().getId().equals(categoryId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không thể gỡ danh mục chính. Hãy đổi danh mục chính của sản phẩm trước");
        }

        ProductCategory pc = productCategoryRepository
                .findByProductIdAndCategoryId(productId, categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Sản phẩm chưa thuộc danh mục này"));
        productCategoryRepository.delete(pc);
    }

    @Override
    public void initCategories(Product product, List<String> extraCategoryIds) {
        Set<String> ids = new HashSet<>();
        if (extraCategoryIds != null) ids.addAll(extraCategoryIds);
        if (product.getCategory() != null) ids.add(product.getCategory().getId());
        saveNew(product, ids);
    }


    private void saveNew(Product product, Set<String> categoryIds) {
        if (categoryIds.isEmpty()) return;

        List<Category> categories = categoryRepository.findAllById(categoryIds);
        if (categories.size() != categoryIds.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Có danh mục không tồn tại");
        }

        productCategoryRepository.saveAll(categories.stream()
                .map(c -> ProductCategory.builder().product(product).category(c).build())
                .toList());
    }

    private Product getProductOrThrow(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy sản phẩm"));
    }
}
