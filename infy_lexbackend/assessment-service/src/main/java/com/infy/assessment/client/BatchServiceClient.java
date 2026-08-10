package com.infy.assessment.client;

import java.util.UUID;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

/**
 * Validates Assessment.scopeId against user-service when scopeType=BATCH
 * (requirement 23: "the batch must exist").
 */
@Component
@RequiredArgsConstructor
public class BatchServiceClient {

    private static final String BATCH_URL = "http://user-service/api/batches/{batchId}";

    private final RestTemplate restTemplate;

    @CircuitBreaker(name = "batchService", fallbackMethod = "batchExistsFallback")
    public boolean batchExists(UUID batchId) {
        try {
            restTemplate.exchange(BATCH_URL, HttpMethod.GET, null, Object.class, batchId);
            return true;
        } catch (HttpClientErrorException.NotFound ex) {
            return false;
        }
    }

    // Fail-open: if user-service is unreachable, don't block assessment
    // creation on a transient dependency outage.
    private boolean batchExistsFallback(UUID batchId, Throwable throwable) {
        return true;
    }
}
