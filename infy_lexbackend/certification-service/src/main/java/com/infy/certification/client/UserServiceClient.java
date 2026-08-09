package com.infy.certification.client;

import java.util.UUID;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.infy.certification.dto.ApiResponse;
import com.infy.certification.exception.BusinessException;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

/**
 * Protected by Resilience4j circuit breaker "userService" — a
 * priority-protected path per constitution.md Section 7.5.
 */
@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private static final String STUDENT_STATUS_URL = "http://user-service/api/students/{studentId}/status";

    private final RestTemplate restTemplate;

    @CircuitBreaker(name = "userService", fallbackMethod = "isStudentActiveFallback")
    public boolean isStudentActive(UUID studentId) {
        try {
            ResponseEntity<ApiResponse<StudentStatusInfo>> response = restTemplate.exchange(
                    STUDENT_STATUS_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<StudentStatusInfo>>() {
                    }, studentId);
            ApiResponse<StudentStatusInfo> body = response.getBody();
            return body != null && body.getData() != null && body.getData().isActive();
        } catch (HttpClientErrorException.NotFound ex) {
            return false;
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "user-service is temporarily unavailable. Please try again shortly.");
        }
    }

    private boolean isStudentActiveFallback(UUID studentId, Throwable throwable) {
        throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                "user-service is temporarily unavailable. Please try again shortly.");
    }
}
