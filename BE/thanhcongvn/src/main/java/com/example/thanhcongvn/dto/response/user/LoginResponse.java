package com.example.thanhcongvn.dto.response.user;

import com.example.thanhcongvn.entity.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String userId;
    private String name;
    private String email;
    private UserRole role;
}
