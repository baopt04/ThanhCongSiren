package com.example.thanhcongvn.dto.response.user;

import com.example.thanhcongvn.entity.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private UserRole role;
    private Integer status;
    private Integer isVerified;
}
