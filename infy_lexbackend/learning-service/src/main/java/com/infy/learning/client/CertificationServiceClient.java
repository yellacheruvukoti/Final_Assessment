package com.infy.learning.client;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.infy.learning.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * Automatic certificate issuance, fired by AssessmentCompletionService once a
 * student meets the certificate-eligibility formula. Reuses the existing
 * certification-service POST /api/certificates contract as-is (same
 * duplicate-prevention and score-threshold rules already enforced there) —
 * failures (including 409 "already issued") are swallowed since this call is
 * a best-effort side effect of quiz submission, not something submission
 * should fail on.
 */
@Component
@RequiredArgsConstructor
public class CertificationServiceClient {

    private static final String CERTIFICATES_URL = "http://certification-service/api/certificates";

    private final RestTemplate restTemplate;

    public void issueCertificate(CertificateIssueRequest request) {
        try {
            restTemplate.exchange(CERTIFICATES_URL, HttpMethod.POST,
                    new HttpEntity<>(request), ApiResponse.class);
        } catch (RestClientException ex) {
            // Best-effort: duplicate (already issued) or transient failure — ignored.
        }
    }
}
