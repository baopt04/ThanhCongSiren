package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.login.ChangePasswordRequest;
import com.example.thanhcongvn.dto.request.login.LoginRequest;
import com.example.thanhcongvn.dto.request.login.RegisterRequest;
import com.example.thanhcongvn.dto.request.login.UpdateProfileRequest;
import com.example.thanhcongvn.dto.response.login.AuthResponse;
import com.example.thanhcongvn.entity.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void saveRefreshToken(User user, String refreshToken);
    void logout(String refreshToken);
    AuthResponse updateProfile(UpdateProfileRequest request );
    AuthResponse getProfile();
    void changePassword(ChangePasswordRequest request);
}
