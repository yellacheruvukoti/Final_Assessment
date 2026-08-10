package com.infy.registration.client;

import java.util.List;
import java.util.UUID;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.infy.registration.dto.ApiResponse;
import com.infy.registration.exception.BusinessException;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

/**
 * Validates COURSE-scoped assessment access: a student may only register for
 * an assessment whose scopeId is a Course they hold an active
 * CourseEnrollment in (requirement 22). Reuses the existing
 * GET /api/courses/enrollments/student/{studentId} endpoint — no new
 * learning-service endpoint required.
 */
@Component
@RequiredArgsConstructor
public class LearningServiceClient {

    private static final String ENROLLMENTS_URL =
            "http://learning-service/api/courses/enrollments/student/{studentId}";

    private final RestTemplate restTemplate;

    @CircuitBreaker(name = "learningService", fallbackMethod = "isEnrolledFallback")
    public boolean isActivelyEnrolled(UUID studentId, UUID courseId) {
        try {
            ResponseEntity<ApiResponse<List<CourseEnrollmentInfo>>> response = restTemplate.exchange(
                    ENROLLMENTS_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<List<CourseEnrollmentInfo>>>() {
                    }, studentId);
            ApiResponse<List<CourseEnrollmentInfo>> body = response.getBody();
            List<CourseEnrollmentInfo> enrollments = body == null || body.getData() == null
                    ? List.of()
                    : body.getData();
            return enrollments.stream()
                    .anyMatch(e -> courseId.equals(e.getCourseId()) && "ACTIVE".equals(e.getEnrollmentStatus()));
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "learning-service is temporarily unavailable. Please try again shortly.");
        }
    }

    private boolean isEnrolledFallback(UUID studentId, UUID courseId, Throwable throwable) {
        throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                "learning-service is temporarily unavailable. Please try again shortly.");
    }
}
