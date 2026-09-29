package com.example.thanhcongvn.controller.customer;

import com.example.thanhcongvn.dto.request.login.ChangePasswordRequest;
import com.example.thanhcongvn.dto.request.login.LoginRequest;
import com.example.thanhcongvn.dto.request.login.RegisterRequest;
import com.example.thanhcongvn.dto.request.login.UpdateProfileRequest;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.login.AuthResponse;
import com.example.thanhcongvn.dto.response.login.RefreshTokenRequest;
import com.example.thanhcongvn.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class CustomerLoginController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiFeResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse result = authService.register(request);

        return ResponseEntity.ok(
                ApiFeResponse.<AuthResponse>builder()
                        .success(true)
                        .data(result)
                        .message("Tạo tài khoản thành công")
                        .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiFeResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse result = authService.login(request);

        // Set refresh token vào HttpOnly cookie (secure: false & sameSite: Lax để hỗ trợ môi trường localhost/dev)
        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/auth")
                .maxAge(Duration.ofDays(7))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(
                ApiFeResponse.<AuthResponse>builder()
                        .success(true)
                        .data(result)
                        .build()
        );
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiFeResponse<AuthResponse>> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletResponse response) {

        String token = (refreshToken != null && !refreshToken.isBlank())
                ? refreshToken
                : (request != null ? request.getRefreshToken() : null);

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Không tìm thấy refresh token");
        }

        AuthResponse result = authService.refreshToken(token);

        // Cập nhật lại cookie với refresh token mới
        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/auth")
                .maxAge(Duration.ofDays(7))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        AuthResponse safeResponse = AuthResponse.builder()
                .accessToken(result.getAccessToken())
                .refreshToken(result.getRefreshToken())
                .id(result.getId())
                .email(result.getEmail())
                .avatar(result.getAvatar())
                .fullName(result.getFullName())
                .role(result.getRole())
                .build();

        return ResponseEntity.ok(
                ApiFeResponse.<AuthResponse>builder().success(true).data(safeResponse).build()
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiFeResponse<Void>> logout(@RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());

        return ResponseEntity.ok(
                ApiFeResponse.<Void>builder()
                        .success(true)
                        .message("Đăng xuất thành công")
                        .build()
        );
    }
}
