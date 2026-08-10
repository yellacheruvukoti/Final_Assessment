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
 * Resolves an assessment-linked Quiz's owning Assessment scope
 * (COURSE/BATCH + scopeId), needed to: (1) gate quiz-attempt access by
 * course enrollment or batch membership, and (2) restrict automatic
 * certificate issuance to COURSE-scoped assessments (requirements 17/22/23).
 */
@Component
@RequiredArgsConstructor
public class AssessmentServiceClient {

    private static final String ASSESSMENT_URL = "http://assessment-service/api/assessments/{assessmentId}";

    private final RestTemplate restTemplate;

    public Optional<AssessmentInfo> getAssessment(UUID assessmentId) {
        try {
            ResponseEntity<ApiResponse<AssessmentInfo>> response = restTemplate.exchange(
                    ASSESSMENT_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<AssessmentInfo>>() {
                    }, assessmentId);
            ApiResponse<AssessmentInfo> body = response.getBody();
            return body == null ? Optional.empty() : Optional.ofNullable(body.getData());
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        } catch (RestClientException ex) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "assessment-service is temporarily unavailable. Please try again shortly.");
        }
    }
}
