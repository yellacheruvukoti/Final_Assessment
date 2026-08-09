package com.infy.learning.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.infy.learning.client.InstructorInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.exception.BusinessException;

import lombok.RequiredArgsConstructor;

/**
 * Ownership authorization shared by course/module/material/quiz/question
 * mutations (VR-002/VR-003/VR-006, BR-003): Administrator may manage any
 * course; Instructor may manage only courses they own.
 */
@Component
@RequiredArgsConstructor
public class CourseAuthorizationService {

    private static final String ROLE_ADMINISTRATOR = "ADMINISTRATOR";
    private static final String ROLE_INSTRUCTOR = "INSTRUCTOR";

    private final UserServiceClient userServiceClient;

    public void requireCourseOwnership(String role, UUID requesterUserId, UUID courseInstructorId) {
        if (role != null && role.equalsIgnoreCase(ROLE_ADMINISTRATOR)) {
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_INSTRUCTOR) && requesterUserId != null) {
            InstructorInfo instructor = userServiceClient.getInstructorByUserId(requesterUserId).orElse(null);
            if (instructor != null && instructor.getInstructorId().equals(courseInstructorId)) {
                return;
            }
        }
        throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                "You are not authorized to manage this course.");
    }
}
