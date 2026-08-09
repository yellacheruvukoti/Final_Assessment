package com.infy.learning.client;

import java.util.Optional;
import java.util.UUID;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.infy.learning.dto.ApiResponse;
import com.infy.learning.exception.BusinessException;

import lombok.RequiredArgsConstructor;

/**
 * Ownership-authorization support only (VR-002/VR-006): resolves the
 * requesting user's instructor identity from X-User-Id so it can be compared
 * against Course.instructorId / Quiz.ownerInstructorId.
 */
@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private static final String INSTRUCTOR_BY_USER_URL = "http://user-service/api/instructors/by-user/{userId}";
    private static final String STUDENT_BY_USER_URL = "http://user-service/api/students/by-user/{userId}";

    private final RestTemplate restTemplate;

    public Optional<InstructorInfo> getInstructorByUserId(UUID userId) {
        try {
            ResponseEntity<ApiResponse<InstructorInfo>> response = restTemplate.exchange(
                    INSTRUCTOR_BY_USER_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<InstructorInfo>>() {
                    }, userId);
            ApiResponse<InstructorInfo> body = response.getBody();
            return body == null ? Optional.empty() : Optional.ofNullable(body.getData());
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "user-service is temporarily unavailable. Please try again shortly.");
        }
    }

    /**
     * Resolves the requesting user's student identity from X-User-Id, needed
     * because CourseEnrollment.studentId / LearnerProgress.studentId store
     * the Student profile id, not the User id (VR-004).
     */
    public Optional<StudentInfo> getStudentByUserId(UUID userId) {
        try {
            ResponseEntity<ApiResponse<StudentInfo>> response = restTemplate.exchange(
                    STUDENT_BY_USER_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<StudentInfo>>() {
                    }, userId);
            ApiResponse<StudentInfo> body = response.getBody();
            return body == null ? Optional.empty() : Optional.ofNullable(body.getData());
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "user-service is temporarily unavailable. Please try again shortly.");
        }
    }
}
