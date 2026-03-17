package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.brand.CreateBrandDTO;
import com.example.thanhcongvn.dto.request.brand.UpdateBrandDTO;
import com.example.thanhcongvn.dto.response.brand.BrandResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BrandService {
    Page<BrandResponse> getAll(Pageable pageable);
    BrandResponse create(CreateBrandDTO createBrandDTO);

    void delete(String id);
    BrandResponse update(String id , UpdateBrandDTO updateBrandDTO);
}
