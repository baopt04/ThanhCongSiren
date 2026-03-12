package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.brand.CreateBrandDTO;
import com.example.thanhcongvn.dto.request.brand.UpdateBrandDTO;
import com.example.thanhcongvn.dto.response.brand.BrandResponse;

import java.util.List;

public interface BrandService {
    List<BrandResponse> getAll();
    BrandResponse create(CreateBrandDTO createBrandDTO);
    BrandResponse update(String id , UpdateBrandDTO updateBrandDTO);
}
