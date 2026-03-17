package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.brand.CreateBrandDTO;
import com.example.thanhcongvn.dto.request.brand.UpdateBrandDTO;
import com.example.thanhcongvn.dto.response.brand.BrandResponse;
import com.example.thanhcongvn.entity.Brand;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.BrandRepository;
import com.example.thanhcongvn.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandServiceImpl implements BrandService {
    @Autowired
    private BrandRepository brandRepository;

    @Override
    public Page<BrandResponse> getAll(Pageable pageable) {
        return brandRepository
                .findAll(pageable)
                .map(this::maptoResponse);
    }

    @Override
    public BrandResponse create(CreateBrandDTO createBrandDTO) {
        if (brandRepository.existsByName(createBrandDTO.getName())) {
            throw new AppException(ErrorCode.BRAND_DUPLICATED);
        }
        Brand brand = new Brand();
        brand.setName(createBrandDTO.getName());
        brand.setDescription(createBrandDTO.getDescription());
        brand.setStatus(createBrandDTO.getStatus());
        brandRepository.save(brand);
        return maptoResponse(brand);

    }

    @Override
    public void delete(String id) {
       Brand brand = brandRepository.findById(id).orElseThrow(() ->
               new AppException(ErrorCode.BRAND_NOT_FOUND));
       brandRepository.delete(brand);
    }

    @Override
    public BrandResponse update(String id, UpdateBrandDTO updateBrandDTO) {
        Brand brand = brandRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.BRAND_NOT_FOUND)
        );
        if (!brand.getName().equals(updateBrandDTO.getName())
                && brandRepository.existsByName(updateBrandDTO.getName())) {
            throw new AppException(ErrorCode.BRAND_DUPLICATED);
        }
        brand.setName(updateBrandDTO.getName());
        brand.setDescription(updateBrandDTO.getDescription());
        brand.setStatus(updateBrandDTO.getStatus());
        brandRepository.save(brand);
        return maptoResponse(brand);
    }

    private BrandResponse maptoResponse(Brand brand) {
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getDescription(),
                brand.getStatus()
        );
    }
}
