package com.infy.summary.client;

import java.util.List;
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

import com.infy.summary.dto.ApiResponse;
import com.infy.summary.exception.BusinessException;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

/**
 * Approved client to user-service, used to resolve the set of students that
 * belong to a batch before registration-service can be queried for their
 * registrations (Registration has no batchId — see TASK-012 design notes).
 * Protected by Resilience4j circuit breaker "userService".
 */
@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private static final String STUDENTS_BY_BATCH_URL = "http://user-service/api/students?batchId={batchId}";
    private static final String BATCH_URL = "http://user-service/api/batches/{batchId}";

    private final RestTemplate restTemplate;

    @CircuitBreaker(name = "userService", fallbackMethod = "getStudentIdsByBatchFallback")
    public List<UUID> getStudentIdsByBatch(UUID batchId) {
        try {
            ResponseEntity<ApiResponse<List<StudentRef>>> response = restTemplate.exchange(
                    STUDENTS_BY_BATCH_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<List<StudentRef>>>() {
                    }, batchId);
            ApiResponse<List<StudentRef>> body = response.getBody();
            if (body == null || body.getData() == null) {
                return List.of();
            }
            return body.getData().stream().map(StudentRef::getStudentId).toList();
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "user-service is temporarily unavailable. Please try again shortly.");
        }
    }

    private List<UUID> getStudentIdsByBatchFallback(UUID batchId, Throwable throwable) {
        throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                "user-service is temporarily unavailable. Please try again shortly.");
    }

    /**
     * Authorization support (VR-010): resolves batch ownership so the
     * service layer can confirm an instructor manages the requested batch.
     */
    @CircuitBreaker(name = "userService", fallbackMethod = "getBatchFallback")
    public Optional<BatchInfo> getBatch(UUID batchId) {
        try {
            ResponseEntity<ApiResponse<BatchInfo>> response = restTemplate.exchange(
                    BATCH_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<BatchInfo>>() {
                    }, batchId);
            ApiResponse<BatchInfo> body = response.getBody();
            return body == null ? Optional.empty() : Optional.ofNullable(body.getData());
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "user-service is temporarily unavailable. Please try again shortly.");
        }
    }

    private Optional<BatchInfo> getBatchFallback(UUID batchId, Throwable throwable) {
        throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                "user-service is temporarily unavailable. Please try again shortly.");
    }
}
