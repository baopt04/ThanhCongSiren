package com.example.thanhcongvn.dto.response.login;

import com.example.thanhcongvn.entity.enums.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String id;
    private String email;
    private String fullName;
    private Gender gender;
    private String avatar;
    private String phone;
    private LocalDate birthday;
    private String role;
}
