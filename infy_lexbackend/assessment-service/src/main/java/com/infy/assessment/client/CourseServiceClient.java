package com.infy.assessment.client;

import java.util.UUID;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

/**
 * Validates Assessment.scopeId against learning-service when
 * scopeType=COURSE, so an instructor cannot associate an assessment with a
 * non-existent course (requirement 22). Read-only existence check only —
 * no shared database, no foreign key across services.
 */
@Component
@RequiredArgsConstructor
public class CourseServiceClient {

    private static final String COURSE_URL = "http://learning-service/api/courses/{courseId}";

    private final RestTemplate restTemplate;

    @CircuitBreaker(name = "courseService", fallbackMethod = "courseExistsFallback")
    public boolean courseExists(UUID courseId) {
        try {
            restTemplate.exchange(COURSE_URL, HttpMethod.GET, null, Object.class, courseId);
            return true;
        } catch (HttpClientErrorException.NotFound ex) {
            return false;
        }
    }

    // Fail-open: if learning-service is unreachable, don't block assessment
    // creation on a transient dependency outage.
    private boolean courseExistsFallback(UUID courseId, Throwable throwable) {
        return true;
    }
}
