package com.example.thanhcongvn.controller.admin;

import com.example.thanhcongvn.dto.request.brand.CreateBrandDTO;
import com.example.thanhcongvn.dto.request.brand.UpdateBrandDTO;
import com.example.thanhcongvn.dto.response.brand.BrandResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.error.ApiResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.service.BrandService;
import jakarta.validation.Valid;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/api/v1/admin/brand")
public class BrandController {
    @Autowired
    private BrandService brandService;

    @GetMapping
    public ResponseEntity<ApiFeResponse<List<BrandResponse>>> getAll(Pageable pageable) {

        Page<BrandResponse> page = brandService.getAll(pageable);

        PaginationResponse pagination = PaginationResponse.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();

        ApiFeResponse<List<BrandResponse>> response = ApiFeResponse.<List<BrandResponse>>builder()
                .success(true)
                .data(page.getContent())
                .pagination(pagination)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<BrandResponse> create(@Valid @RequestBody CreateBrandDTO createBrandDTO) {
        BrandResponse brandResponse = brandService.create(createBrandDTO);
        return ResponseEntity.ok(brandResponse);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<BrandResponse> update(@PathVariable String id, @Valid @RequestBody UpdateBrandDTO update) {
        BrandResponse brandResponse = brandService.update(id, update);
        return ResponseEntity.ok(brandResponse);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        brandService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
