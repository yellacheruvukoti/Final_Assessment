package com.passportsahayak.application.controller;

import com.passportsahayak.application.dto.ApplicationResponse;
import com.passportsahayak.application.dto.InternalStatusUpdateRequest;
import com.passportsahayak.application.exception.ApiException;
import com.passportsahayak.application.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Service-to-service endpoint. Called by appointment-service, police-verification-service
 * and fraud-service to progress the canonical application status they own their part of.
 * Authenticated with a shared static key rather than a user JWT (no end user is involved).
 */
@RestController
@RequestMapping("/internal/applications")
@RequiredArgsConstructor
public class InternalApplicationController {

    private final ApplicationService applicationService;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    @PatchMapping("/{arn}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(@RequestHeader("X-Internal-Key") String key,
                                                              @PathVariable String arn,
                                                              @Valid @RequestBody InternalStatusUpdateRequest request) {
        if (!internalApiKey.equals(key)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid internal service key");
        }
        return ResponseEntity.ok(applicationService.updateStatus(arn, request));
    }
}
