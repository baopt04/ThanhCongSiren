package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.product.CreateProductDTO;
import com.example.thanhcongvn.dto.request.product.ProductFilterRequest;
import com.example.thanhcongvn.dto.request.product.UpdateProductDTO;
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

    // ================= UPDATE =================
    @PutMapping("/update/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable String id,
            @RequestBody UpdateProductDTO dto) {

        ProductResponse response = productService.updateProduct(id, dto);
        return ResponseEntity.ok(response);
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(productService.getById(id));
    }

    // ================= GET ALL + FILTER =================
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAll(
            ProductFilterRequest filter,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return ResponseEntity.ok(productService.getAll(filter, pageable));
    }

    // ================= UPDATE STOCK =================
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Void> updateStock(
            @PathVariable String id,
            @RequestParam Integer quantity) {

        productService.updateStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    // ================= UPDATE PRICE =================
    @PatchMapping("/{id}/price")
    public ResponseEntity<Void> updatePrice(
            @PathVariable String id,
            @RequestParam BigDecimal price,
            @RequestParam(required = false) BigDecimal salePrice) {

        productService.updatePrice(id, price, salePrice);
        return ResponseEntity.ok().build();
    }

    // ================= TOGGLE ACTIVE =================
    @PatchMapping("/{id}/active")
    public ResponseEntity<Void> toggleActive(
            @PathVariable String id) {

        productService.toggleActive(id);
        return ResponseEntity.ok().build();
    }

    // ================= TOGGLE FEATURED =================
    @PatchMapping("/{id}/featured")
    public ResponseEntity<Void> toggleFeatured(
            @PathVariable String id) {

        productService.toggleFeatured(id);
        return ResponseEntity.ok().build();
    }
}
