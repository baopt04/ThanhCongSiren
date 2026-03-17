package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.product.CreateProductDTO;
import com.example.thanhcongvn.dto.request.product.ProductFilterRequest;
import com.example.thanhcongvn.dto.request.product.UpdateProductDTO;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.dto.response.product.ProductResponse;
import com.example.thanhcongvn.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/product")
@RequiredArgsConstructor
public class ProductController {
private final ProductService productService;
    @PostMapping("/create")
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody CreateProductDTO dto) {

        ProductResponse response = productService.createProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable String id,
            @RequestBody UpdateProductDTO dto) {

        ProductResponse response = productService.updateProduct(id, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiFeResponse<List<ProductResponse>>> getAll(
            ProductFilterRequest filter,
            Pageable pageable) {
        Page<ProductResponse> page = productService.getAll(filter , pageable);
        PaginationResponse pagination = PaginationResponse.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();

        ApiFeResponse<List<ProductResponse>> response =
                ApiFeResponse.<List<ProductResponse>>builder()
                        .success(true)
                        .data(page.getContent())
                        .pagination(pagination)
                        .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Void> updateStock(
            @PathVariable String id,
            @RequestParam Integer quantity) {

        productService.updateStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/price")
    public ResponseEntity<Void> updatePrice(
            @PathVariable String id,
            @RequestParam BigDecimal price) {

        productService.updatePrice(id, price);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/{id}/sale-price")
    public ResponseEntity<Void> updateSalePrice(
            @PathVariable String id,
            @RequestParam BigDecimal salePrice) {

        productService.updateSalePrice(id, salePrice);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Void> toggleActive(
            @PathVariable String id) {

        productService.toggleActive(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/featured")
    public ResponseEntity<Void> toggleFeatured(
            @PathVariable String id) {

        productService.toggleFeatured(id);
        return ResponseEntity.ok().build();
    }
}
