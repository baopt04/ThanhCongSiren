package com.example.thanhcongvn.controller.customer;

import com.example.thanhcongvn.dto.request.login.ChangePasswordRequest;
import com.example.thanhcongvn.dto.request.login.UpdateProfileRequest;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.login.AuthResponse;
import com.example.thanhcongvn.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user/profile")
public class CustomerProfileController {
    private final AuthService authService;
    @PutMapping("/update")
    public ResponseEntity<ApiFeResponse<AuthResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        AuthResponse response = authService.updateProfile(request);

        return ResponseEntity.ok(
                ApiFeResponse.<AuthResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiFeResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(request);

        return ResponseEntity.ok(
                ApiFeResponse.<Void>builder()
                        .success(true)
                        .message("Đổi mật khẩu thành công")
                        .build()
        );
    }
    @GetMapping("/get-profile")
    public ResponseEntity<ApiFeResponse<AuthResponse>> getProfile() {

        AuthResponse response = authService.getProfile();

        return ResponseEntity.ok(
                ApiFeResponse.<AuthResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
}
