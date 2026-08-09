package com.infy.summary.client;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.infy.summary.dto.ApiResponse;
import com.infy.summary.exception.BusinessException;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

/**
 * Protected by Resilience4j circuit breaker "registrationService" — a
 * priority-protected path per constitution.md Section 7.5.
 */
@Component
@RequiredArgsConstructor
public class RegistrationServiceClient {

    private static final String REGISTRATIONS_BY_STUDENTS_URL =
            "http://registration-service/api/registrations?studentIds={studentIds}";

    private final RestTemplate restTemplate;

    @CircuitBreaker(name = "registrationService", fallbackMethod = "getRegistrationsByStudentIdsFallback")
    public List<RegistrationInfo> getRegistrationsByStudentIds(List<UUID> studentIds) {
        if (studentIds.isEmpty()) {
            return List.of();
        }
        try {
            String joined = studentIds.stream().map(UUID::toString).collect(Collectors.joining(","));
            ResponseEntity<ApiResponse<List<RegistrationInfo>>> response = restTemplate.exchange(
                    REGISTRATIONS_BY_STUDENTS_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<List<RegistrationInfo>>>() {
                    }, joined);
            ApiResponse<List<RegistrationInfo>> body = response.getBody();
            return body == null || body.getData() == null ? List.of() : body.getData();
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "registration-service is temporarily unavailable. Please try again shortly.");
        }
    }

    private List<RegistrationInfo> getRegistrationsByStudentIdsFallback(List<UUID> studentIds, Throwable throwable) {
        throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                "registration-service is temporarily unavailable. Please try again shortly.");
    }
}
