package com.infy.user.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.user.dto.LoginRequest;
import com.infy.user.dto.LoginResponse;
import com.infy.user.dto.UserResponse;
import com.infy.user.entity.User;
import com.infy.user.enums.UserRole;
import com.infy.user.enums.UserStatus;
import com.infy.user.exception.BusinessException;
import com.infy.user.mapper.UserMapper;
import com.infy.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * MVP login per api-contract.md Section 2 ("simple role-based access
     * control without enterprise IAM details") and the absence of any
     * password field on User/users across the data model: identity is
     * established by a valid, ACTIVE email match only. The password field on
     * the request is required for a well-formed request but is not verified
     * against stored credentials, since none are persisted in this schema.
     */
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                        "Invalid email or password."));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                    "Invalid email or password.");
        }
        return LoginResponse.builder().userId(user.getUserId()).role(user.getRole()).build();
    }

    public List<UserResponse> listUsers(UserRole roleFilter, UserStatus statusFilter) {
        List<User> users;
        if (roleFilter != null && statusFilter != null) {
            users = userRepository.findByRoleAndStatus(roleFilter, statusFilter);
        } else if (roleFilter != null) {
            users = userRepository.findByRole(roleFilter);
        } else if (statusFilter != null) {
            users = userRepository.findByStatus(statusFilter);
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(UserMapper::toResponse).toList();
    }

    public UserResponse getUser(UUID userId) {
        return UserMapper.toResponse(findUserOrThrow(userId));
    }

    public UserRole getUserRole(UUID userId) {
        return findUserOrThrow(userId).getRole();
    }

    public UserStatus getUserStatus(UUID userId) {
        return findUserOrThrow(userId).getStatus();
    }

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                        "User not found for id " + userId));
    }
}
