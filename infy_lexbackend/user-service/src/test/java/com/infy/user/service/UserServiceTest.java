package com.infy.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.user.entity.User;
import com.infy.user.enums.UserRole;
import com.infy.user.enums.UserStatus;
import com.infy.user.exception.BusinessException;
import com.infy.user.repository.UserRepository;

/**
 * TC-USER-001: retrieve existing user profile.
 * TC-USER-002: retrieve role for existing user.
 * TC-USER-003: unknown user id raises USER_NOT_FOUND.
 * No predefined test case IDs exist in test.md (file is empty) — these are
 * self-defined, traceable to FR-001..FR-013 baseline user context needs.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void tcUser001_getUser_returnsMappedResponse() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .userId(userId)
                .userCode("USR-0001")
                .fullName("Alice Johnson")
                .email("alice@infy.com")
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        var response = userService.getUser(userId);

        assertThat(response.getUserCode()).isEqualTo("USR-0001");
        assertThat(response.getRole()).isEqualTo(UserRole.STUDENT);
    }

    @Test
    void tcUser002_getUserRole_returnsRole() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().userId(userId).role(UserRole.INSTRUCTOR).status(UserStatus.ACTIVE).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThat(userService.getUserRole(userId)).isEqualTo(UserRole.INSTRUCTOR);
    }

    @Test
    void tcUser003_getUser_unknownId_throwsUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUser(userId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("USER_NOT_FOUND"));
    }
}
