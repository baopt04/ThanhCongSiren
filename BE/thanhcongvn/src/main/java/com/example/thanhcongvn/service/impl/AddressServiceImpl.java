package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.address.AddressRequest;
import com.example.thanhcongvn.dto.response.address.AddressResponse;
import com.example.thanhcongvn.entity.Address;
import com.example.thanhcongvn.entity.User;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.AddressRepository;
import com.example.thanhcongvn.repository.UserRepository;
import com.example.thanhcongvn.service.AddressService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressServiceImpl implements AddressService {
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public AddressResponse create(AddressRequest request) {
        User user = getCurrentUser();

        if (Integer.valueOf(1).equals(request.getIsDefault())) {
            addressRepository.clearDefaultAddress(user.getId());
        }
        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setProvince_id(request.getProvinceId());
        address.setWard_id(request.getWardId());
        address.setTo_district_id(request.getToDistrictId());
        address.setIsDefault(request.getIsDefault());

        Address addressSave = addressRepository.save(address);

        return mapToResponse(addressSave);
    }

    @Override
    @Transactional
    public AddressResponse update(String addressId, AddressRequest request) {
        User user = getCurrentUser();

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        // Quan trọng: đảm bảo address thuộc user hiện tại
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền cập nhật địa chỉ này");
        }
        if (Integer.valueOf(1).equals(request.getIsDefault())) {
            addressRepository.clearDefaultAddress(user.getId());
        }
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setProvince_id(request.getProvinceId());
        address.setWard_id(request.getWardId());
        address.setTo_district_id(request.getToDistrictId());
        address.setIsDefault(request.getIsDefault());
Address addressSave = addressRepository.save(address);
        return mapToResponse(addressSave);
    }

    @Override
    @Transactional
    public void delete( String addressId) {
        User user = getCurrentUser();
        Address address = addressRepository
                .findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        addressRepository.delete(address);
    }

    @Override
    public List<AddressResponse> getMyAddresses() {
        User user = getCurrentUser();
        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void setDefault(String addressId) {

        User user = getCurrentUser();

        Address address = addressRepository
                .findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        addressRepository.clearDefaultAddress(user.getId());

        address.setIsDefault(1);

        addressRepository.save(address);
    }

    private AddressResponse mapToResponse(Address address) {

        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .street(address.getStreet())
                .ward(address.getWard())
                .district(address.getDistrict())
                .province(address.getProvince())
                .provinceId(address.getProvince_id())
                .toDistrictId(address.getTo_district_id())
                .wardId(address.getWard_id())
                .isDefault(address.getIsDefault())
                .build();
    }

    private User getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
