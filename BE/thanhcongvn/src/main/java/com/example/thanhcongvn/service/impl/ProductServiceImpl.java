package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.projection.ProductListView;
import com.example.thanhcongvn.dto.request.product.CreateProductDTO;
import com.example.thanhcongvn.dto.request.product.ProductFilterRequest;
import com.example.thanhcongvn.dto.request.product.UpdateProductDTO;
import com.example.thanhcongvn.dto.response.customer.product.ListProductResponse;
import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.example.thanhcongvn.dto.response.product.ProductResponse;
import com.example.thanhcongvn.entity.Brand;
import com.example.thanhcongvn.entity.Category;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductImage;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.BrandRepository;
import com.example.thanhcongvn.repository.CategoryRepository;
import com.example.thanhcongvn.repository.ProductImageRepository;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.service.ProductService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private ProductImageRepository productImageRepository;

    @Override
    public ProductResponse createProduct(CreateProductDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
        if (productRepository.existsBySku(dto.getSku())) {
            throw new AppException(ErrorCode.SKU_DUPLICATED);
        }
        if (productRepository.existsBySlug(dto.getSlug())) {
            throw new AppException(ErrorCode.SLUG_DUPLICATED);
        }
        Product product = Product.builder()
                .category(category)
                .brand(brand)
                .name(dto.getName())
                .slug(dto.getSlug())
                .sku(dto.getSku())
                .description(dto.getDescription())
                .longDescription(dto.getLongDescription())
                .price(dto.getPrice())
                .salePrice(dto.getSalePrice())
                .costPrice(dto.getCostPrice())
                .stockQuantity(dto.getStockQuantity())
                .weight(dto.getWeight())
                .isActive(dto.getIsActive())
                .isFeatured(dto.getIsFeatured())
                .build();
        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(String id, UpdateProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (dto.getCategoryId() != null &&
                !dto.getCategoryId().equals(product.getCategory().getId())) {

            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

            product.setCategory(category);
        }

        if (dto.getBrandId() != null &&
                !dto.getBrandId().equals(product.getBrand().getId())) {

            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));

            product.setBrand(brand);
        }

        if (dto.getSku() != null &&
                !dto.getSku().equals(product.getSku()) &&
                productRepository.existsBySku(dto.getSku())) {

            throw new AppException(ErrorCode.SKU_DUPLICATED);
        }

        if (dto.getSlug() != null &&
                !dto.getSlug().equals(product.getSlug()) &&
                productRepository.existsBySlug(dto.getSlug())) {

            throw new AppException(ErrorCode.SLUG_DUPLICATED);
        }

        if (dto.getName() != null) {
            product.setName(dto.getName());
        }

        if (dto.getSlug() != null) {
            product.setSlug(dto.getSlug());
        }

        if (dto.getSku() != null) {
            product.setSku(dto.getSku());
        }

        if (dto.getDescription() != null) {
            product.setDescription(dto.getDescription());
        }

        if (dto.getLongDescription() != null) {
            product.setLongDescription(dto.getLongDescription());
        }

        if (dto.getPrice() != null) {
            product.setPrice(dto.getPrice());
        }


        if (dto.getCostPrice() != null) {
            product.setCostPrice(dto.getCostPrice());
        }

        if (dto.getStockQuantity() != null) {
            product.setStockQuantity(dto.getStockQuantity());
        }

        if (dto.getWeight() != null) {
            product.setWeight(dto.getWeight());
        }

        if (dto.getThumbnailUrl() != null) {
            product.setThumbnailUrl(dto.getThumbnailUrl());
        }

        if (dto.getIsActive() != null) {
            product.setIsActive(dto.getIsActive());
        }

        if (dto.getIsFeatured() != null) {
            product.setIsFeatured(dto.getIsFeatured());
        }

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public void deleteProduct(String id) {

    }

    @Override
    public ProductResponse getById(String id) {
        Product product = productRepository.findDetailById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return mapToResponse(product);
    }

    @Override
    public Page<ProductResponse> getAll(ProductFilterRequest filter, Pageable pageable) {
        return productRepository.findAllForAdminList(pageable)
                .map(this::mapToListResponse);
    }

    @Override
    public void updateStock(String productId, Integer quantity) {
        if (quantity < 0) {
            throw new AppException(ErrorCode.PRODUCT_STOCK);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setStockQuantity(quantity);

        productRepository.save(product);
    }

    @Override
    public void updatePrice(String productId, BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.PRODUCT_PRICE);
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setPrice(price);

        productRepository.save(product);
    }

    @Override
    public void updateSalePrice(String productId, BigDecimal salePrice) {
        if (salePrice == null || salePrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.PRODUCT_PRICE);
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setSalePrice(salePrice);

        productRepository.save(product);
    }

    @Override
    public void toggleActive(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setIsActive(product.getIsActive() == 1 ? 0 : 1);

        productRepository.save(product);
    }

    @Override
    public void toggleFeatured(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setIsFeatured(product.getIsFeatured() == 1 ? 0 : 1);

        productRepository.save(product);
    }




    private ProductResponse mapToListResponse(ProductListView product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .sku(product.getSku())
                .categoryId(product.getCategoryId())
                .categoryName(product.getCategoryName())
                .brandId(product.getBrandId())
                .brandName(product.getBrandName())
                .description(product.getDescription())
                // longDescription intentionally omitted from list SQL (LONGTEXT) —
                // FE loads full product on edit via getById
                .longDescription(null)
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .costPrice(product.getCostPrice())
                .stockQuantity(product.getStockQuantity())
                .weight(product.getWeight())
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .createdAt(product.getCreatedAt())
                .build();
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .sku(product.getSku())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .description(product.getDescription())
                .longDescription(product.getLongDescription())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .costPrice(product.getCostPrice())
                .stockQuantity(product.getStockQuantity())
                .weight(product.getWeight())
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
