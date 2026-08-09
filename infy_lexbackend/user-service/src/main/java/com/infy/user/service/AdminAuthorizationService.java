package com.infy.user.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.infy.user.exception.BusinessException;

/**
 * Administrator-only gate for student/instructor mutations, same
 * X-Role-header pattern as learning-service's CourseAuthorizationService.
 */
@Component
public class AdminAuthorizationService {

    private static final String ROLE_ADMINISTRATOR = "ADMINISTRATOR";

    public void requireAdministrator(String role) {
        if (role == null || !role.equalsIgnoreCase(ROLE_ADMINISTRATOR)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "USER_ACCESS_DENIED",
                    "You are not authorized to manage students or instructors.");
        }
    }
}
