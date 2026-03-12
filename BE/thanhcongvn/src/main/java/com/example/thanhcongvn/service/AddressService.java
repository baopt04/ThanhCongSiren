package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.address.AddressRequest;
import com.example.thanhcongvn.dto.response.address.AddressResponse;

import java.util.List;

public interface AddressService {

    AddressResponse create(String userId, AddressRequest request);

    AddressResponse update(String userId, String addressId, AddressRequest request);

    void delete(String userId, String addressId);

    List<AddressResponse> getMyAddresses(String userId);

    void setDefault(String userId, String addressId);
}
