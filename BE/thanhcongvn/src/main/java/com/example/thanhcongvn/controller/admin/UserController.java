package com.example.thanhcongvn.controller.admin;

import com.cloudinary.Api;
import com.example.thanhcongvn.dto.request.user.UserCreateRequest;
import com.example.thanhcongvn.dto.request.user.UserUpdateRequest;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.dto.response.user.UserResponse;
import com.example.thanhcongvn.service.UserService;
import jakarta.validation.Valid;
import org.hibernate.annotations.Array;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<UserResponse> create(
            @Valid @RequestBody UserCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateRequest request) {

        return ResponseEntity.ok(userService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable String id) {

        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiFeResponse<List<UserResponse>>> getAll(Pageable pageable) {

        Page<UserResponse> page = userService.getAll(pageable);
        PaginationResponse paginationResponse = PaginationResponse.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();
        ApiFeResponse<List<UserResponse>> response = ApiFeResponse.<List<UserResponse>>builder()
                .success(true)
                .data(page.getContent())
                .pagination(paginationResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {

        userService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable String id) {
        userService.toggleStatus(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable String id,
            @RequestParam String newPassword) {

        userService.changePassword(id, newPassword);
        return ResponseEntity.ok().build();
    }
}
