package com.example.thanhcongvn.dto.response.login;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RefreshTokenRequest {
    @NotBlank
    private String refreshToken;
}
