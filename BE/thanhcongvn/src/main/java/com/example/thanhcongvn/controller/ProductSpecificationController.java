package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.specification.CreateProductSpecificationDTO;
import com.example.thanhcongvn.dto.request.specification.UpdateProductSpecificationDTO;
import com.example.thanhcongvn.dto.response.specification.ProductSpecificationResponse;
import com.example.thanhcongvn.service.ProductService;
import com.example.thanhcongvn.service.ProductSpecificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-specifications")
public class ProductSpecificationController {
    @Autowired
    private ProductSpecificationService specificationService;
    @GetMapping
    public ResponseEntity<List<ProductSpecificationResponse>> getAll(){
        return ResponseEntity.ok(specificationService.getAll());
    }
    @PostMapping("/create")
    public ResponseEntity<ProductSpecificationResponse> create(
            @Valid @RequestBody CreateProductSpecificationDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(specificationService.create(dto));
    }
    @PutMapping("/{id}/update")
    public ResponseEntity<ProductSpecificationResponse> update(
            @PathVariable String id,
            @RequestBody UpdateProductSpecificationDTO dto) {

        return ResponseEntity.ok(specificationService.update(id, dto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {

        specificationService.delete(id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductSpecificationResponse>> getByProduct(
            @PathVariable String productId) {

        return ResponseEntity.ok(specificationService.getByProductId(productId));
    }
}
