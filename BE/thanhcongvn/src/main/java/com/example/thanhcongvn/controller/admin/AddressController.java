package com.example.thanhcongvn.controller.admin;

import com.example.thanhcongvn.dto.request.address.AddressRequest;
import com.example.thanhcongvn.dto.response.address.AddressResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/address")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping("/create")
    public ResponseEntity<ApiFeResponse<AddressResponse>> create(
            @RequestBody AddressRequest request) {

        AddressResponse response = addressService.create(request);

        return ResponseEntity.ok(
                ApiFeResponse.<AddressResponse>builder()
                        .success(true)
                        .message("Tạo thành công địa chỉ mới")
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiFeResponse<List<AddressResponse>>> getMyAddresses() {
        List<AddressResponse> addresses = addressService.getMyAddresses();

        return ResponseEntity.ok(
                ApiFeResponse.<List<AddressResponse>>builder()
                        .success(true)
                        .data(addresses)
                        .build()
        );
    }

    @PutMapping("/{addressId}/update")
    public ResponseEntity<ApiFeResponse<AddressResponse>> update(
            @PathVariable String addressId,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse response = addressService.update(addressId, request);

        return ResponseEntity.ok(
                ApiFeResponse.<AddressResponse>builder()
                        .success(true)
                        .data(response)
                        .message("Cập nhật địa chỉ thành công")
                        .build()
        );
    }

    @DeleteMapping("/{addressId}/delete")
    public ResponseEntity<Void> delete(@PathVariable String addressId) {

        addressService.delete(addressId);

        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{id}/default")
    public ResponseEntity<Void> setDefault(
            @PathVariable String id) {
        addressService.setDefault(id);
        return ResponseEntity.noContent().build();
    }
}
