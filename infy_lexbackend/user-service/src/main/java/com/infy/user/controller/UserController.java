package com.infy.user.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.user.dto.ApiResponse;
import com.infy.user.dto.UserResponse;
import com.infy.user.enums.UserRole;
import com.infy.user.enums.UserStatus;
import com.infy.user.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Users retrieved successfully.", userService.listUsers(role, status)));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID userId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("User retrieved successfully.", userService.getUser(userId)));
    }

    @GetMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<Object>> getUserRole(@PathVariable UUID userId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("User role retrieved successfully.", userService.getUserRole(userId)));
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<Object>> getUserStatus(@PathVariable UUID userId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("User status retrieved successfully.", userService.getUserStatus(userId)));
    }
}
