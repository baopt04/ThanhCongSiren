package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.user.UserCreateRequest;
import com.example.thanhcongvn.dto.request.user.UserUpdateRequest;
import com.example.thanhcongvn.dto.response.user.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse create(UserCreateRequest request);

    UserResponse update(String id, UserUpdateRequest request);

    UserResponse getById(String id);

    Page<UserResponse> getAll(Pageable pageable);

    void delete(String id);

    void toggleStatus(String id);

    void changePassword(String id, String newPassword);
}
