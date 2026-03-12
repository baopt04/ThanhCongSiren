package com.example.thanhcongvn.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotBlank
    private String name;

    private String phone;

    private String avatarUrl;

    private Integer status;
}
