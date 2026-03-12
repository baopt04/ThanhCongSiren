package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.brand.CreateBrandDTO;
import com.example.thanhcongvn.dto.request.brand.UpdateBrandDTO;
import com.example.thanhcongvn.dto.response.brand.BrandResponse;
import com.example.thanhcongvn.entity.Brand;
import com.example.thanhcongvn.repository.BrandRepository;
import com.example.thanhcongvn.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandServiceImpl implements BrandService {
    @Autowired
    private BrandRepository brandRepository;

    @Override
    public List<BrandResponse> getAll() {
        return brandRepository.findAll()
                .stream()
                .map(this::maptoResponse)
                .toList();
    }

    @Override
    public BrandResponse create(CreateBrandDTO createBrandDTO) {
        if (brandRepository.existsByName(createBrandDTO.getName())) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại");
        }
        Brand brand = new Brand();
        brand.setName(createBrandDTO.getName());
        brand.setDescription(createBrandDTO.getDescription());
        brand.setStatus(createBrandDTO.getStatus());
        brandRepository.save(brand);
        System.out.println("Check mapto" + maptoResponse(brand));
        return maptoResponse(brand);

    }

    @Override
    public BrandResponse update(String id, UpdateBrandDTO updateBrandDTO) {
        Brand brand = brandRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy thương hiệu")
        );
        if (!brand.getName().equals(updateBrandDTO.getName())
                && brandRepository.existsByName(updateBrandDTO.getName())) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại");
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
