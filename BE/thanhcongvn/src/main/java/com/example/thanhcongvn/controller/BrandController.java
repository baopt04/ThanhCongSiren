package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.brand.CreateBrandDTO;
import com.example.thanhcongvn.dto.request.brand.UpdateBrandDTO;
import com.example.thanhcongvn.dto.response.brand.BrandResponse;
import com.example.thanhcongvn.service.BrandService;
import jakarta.validation.Valid;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/api/v1/brand")
public class BrandController {
    @Autowired
    private BrandService brandService;
    @GetMapping("/getAll")
    public ResponseEntity<List<BrandResponse>> getAll(){
        return ResponseEntity.ok(brandService.getAll());
    }
    @PostMapping("/create")
    public ResponseEntity<BrandResponse> create(@Valid @RequestBody CreateBrandDTO createBrandDTO) {
        BrandResponse brandResponse = brandService.create(createBrandDTO);
        return ResponseEntity.ok(brandResponse);
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<BrandResponse> update(@PathVariable String id , @Valid @RequestBody UpdateBrandDTO update) {
        BrandResponse brandResponse = brandService.update(id , update);
        return ResponseEntity.ok(brandResponse);
    }

}
