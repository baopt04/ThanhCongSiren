package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.request.user.UserCreateRequest;
import com.example.thanhcongvn.dto.request.user.UserUpdateRequest;
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

@RestController
@RequestMapping("/api/v1/users")
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
    public ResponseEntity<Page<UserResponse>> getAll(Pageable pageable) {

        return ResponseEntity.ok(userService.getAll(pageable));
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
