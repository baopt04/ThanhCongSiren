package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.response.address.AddressResponse;
import com.example.thanhcongvn.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {
//    @Autowired
//    private AddressService addressService;
//    @PostMapping
//    public ResponseEntity<AddressResponse> create(
//            @AuthenticationPrincipal CustomUserDetails user,
//            @RequestBody AddressRequest request) {
//
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(service.create(user.getId(), request));
//    }
//
//    @GetMapping
//    public ResponseEntity<List<AddressResponse>> getMyAddresses(
//            @AuthenticationPrincipal CustomUserDetails user) {
//
//        return ResponseEntity.ok(service.getMyAddresses(user.getId()));
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<AddressResponse> update(
//            @AuthenticationPrincipal CustomUserDetails user,
//            @PathVariable String id,
//            @RequestBody AddressRequest request) {
//
//        return ResponseEntity.ok(service.update(user.getId(), id, request));
//    }
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(
//            @AuthenticationPrincipal CustomUserDetails user,
//            @PathVariable String id) {
//
//        service.delete(user.getId(), id);
//        return ResponseEntity.ok().build();
//    }
//
//    @PutMapping("/{id}/default")
//    public ResponseEntity<Void> setDefault(
//            @AuthenticationPrincipal CustomUserDetails user,
//            @PathVariable String id) {
//
//        service.setDefault(user.getId(), id);
//        return ResponseEntity.ok().build();
//    }
}
