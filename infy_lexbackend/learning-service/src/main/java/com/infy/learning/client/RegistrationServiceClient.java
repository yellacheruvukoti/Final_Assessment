package com.infy.learning.client;

import java.util.List;
import java.util.UUID;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.infy.learning.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * Best-effort registration lookup used only to gate automatic certificate
 * issuance (see AssessmentCompletionService). Failures here must never break
 * quiz submission, so errors are swallowed and treated as "not registered"
 * rather than propagated.
 */
@Component
@RequiredArgsConstructor
public class RegistrationServiceClient {

    private static final String STUDENT_REGISTRATIONS_URL =
            "http://registration-service/api/students/{studentId}/registrations";

    private final RestTemplate restTemplate;

    public boolean isActivelyRegistered(UUID studentId, UUID assessmentId) {
        try {
            ResponseEntity<ApiResponse<List<RegistrationInfo>>> response = restTemplate.exchange(
                    STUDENT_REGISTRATIONS_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<ApiResponse<List<RegistrationInfo>>>() {
                    }, studentId);
            ApiResponse<List<RegistrationInfo>> body = response.getBody();
            List<RegistrationInfo> registrations = body == null || body.getData() == null
                    ? List.of()
                    : body.getData();
            return registrations.stream()
                    .anyMatch(r -> assessmentId.equals(r.getAssessmentId()) && "REGISTERED".equalsIgnoreCase(r.getStatus()));
        } catch (RestClientException ex) {
            return false;
        }
    }
}
