package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.address.AddressRequest;
import com.example.thanhcongvn.dto.response.address.AddressResponse;
import com.example.thanhcongvn.entity.Address;
import com.example.thanhcongvn.entity.User;
import com.example.thanhcongvn.repository.AddressRepository;
import com.example.thanhcongvn.repository.UserRepository;
import com.example.thanhcongvn.service.AddressService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@Transactional
public class AddressServiceImpl implements AddressService {
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public AddressResponse create(String userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (request.getIsDefault() == 1) {
            addressRepository.clearDefaultAddress(userId);
        }

        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setPostalCode(request.getPostalCode());
        address.setIsDefault(request.getIsDefault());

        addressRepository.save(address);

        return mapToResponse(address);
    }

    @Override
    public AddressResponse update(String userId, String addressId, AddressRequest request) {
        Address address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        if (request.getIsDefault() == 1) {
            addressRepository.clearDefaultAddress(userId);
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setPostalCode(request.getPostalCode());
        address.setIsDefault(request.getIsDefault());

        return mapToResponse(address);
    }

    @Override
    public void delete(String userId, String addressId) {
        Address address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        addressRepository.delete(address);
    }

    @Override
    public List<AddressResponse> getMyAddresses(String userId) {

        return addressRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void setDefault(String userId, String addressId) {
        Address address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        addressRepository.clearDefaultAddress(userId);

        address.setIsDefault(1);
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
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .build();
    }
}
