package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.address.AddressRequest;
import com.example.thanhcongvn.dto.response.address.AddressResponse;

import java.util.List;

public interface AddressService {

    AddressResponse create( AddressRequest request);

    AddressResponse update( String addressId, AddressRequest request);

    void delete( String addressId);

    List<AddressResponse> getMyAddresses();

    void setDefault( String addressId);
}
