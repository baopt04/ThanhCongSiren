package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.specification.CreateProductSpecificationDTO;
import com.example.thanhcongvn.dto.request.specification.UpdateProductSpecificationDTO;
import com.example.thanhcongvn.dto.response.specification.ProductSpecificationResponse;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductSpecification;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.repository.ProductSpecificationRepository;
import com.example.thanhcongvn.service.ProductSpecificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
public class ProductSpecificationServiceImpl implements ProductSpecificationService {
    @Autowired
    private ProductSpecificationRepository specificationRepository;
    @Autowired
    private ProductRepository productRepository;

    @Override
    public ProductSpecificationResponse create(CreateProductSpecificationDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        ProductSpecification spec = ProductSpecification.builder()
                .product(product)
                .specName(dto.getSpecName())
                .specValue(dto.getSpecValue())
                .groupName(dto.getGroupName())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .build();

        specificationRepository.save(spec);

        return mapToResponse(spec);
    }

    @Override
    public ProductSpecificationResponse update(String id, UpdateProductSpecificationDTO dto) {
        ProductSpecification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specification không tồn tại"));

        if (dto.getSpecName() != null) {
            spec.setSpecName(dto.getSpecName());
        }

        if (dto.getSpecValue() != null) {
            spec.setSpecValue(dto.getSpecValue());
        }

        if (dto.getGroupName() != null) {
            spec.setGroupName(dto.getGroupName());
        }

        if (dto.getDisplayOrder() != null) {
            spec.setDisplayOrder(dto.getDisplayOrder());
        }

        specificationRepository.save(spec);

        return mapToResponse(spec);
    }

    @Override
    public void delete(String id) {
        specificationRepository.deleteById(id);
    }

    @Override
    public List<ProductSpecificationResponse> getAll() {
        return specificationRepository.findAllWithProduct()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ProductSpecificationResponse> getByProductId(String productId) {
        return specificationRepository
                .findByProductIdOrderByDisplayOrderAsc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteByProductId(String productId) {
        specificationRepository.deleteByProductId(productId);
    }
    private ProductSpecificationResponse mapToResponse(ProductSpecification spec) {
        return ProductSpecificationResponse.builder()
                .id(spec.getId())
                .productId(spec.getProduct().getId())
                .specName(spec.getSpecName())
                .specValue(spec.getSpecValue())
                .groupName(spec.getGroupName())
                .displayOrder(spec.getDisplayOrder())
                .build();
    }
}
