package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.user.LoginRequest;
import com.example.thanhcongvn.dto.response.user.LoginResponse;

public interface AuthenticationService {
    LoginResponse login(LoginRequest request);
}
