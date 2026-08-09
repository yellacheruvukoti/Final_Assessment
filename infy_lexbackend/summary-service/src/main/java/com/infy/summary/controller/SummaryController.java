package com.infy.summary.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.summary.dto.ApiResponse;
import com.infy.summary.dto.AssessmentWiseSummaryResponse;
import com.infy.summary.dto.RegistrationSummaryResponse;
import com.infy.summary.service.SummaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/summaries/batches")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping("/{batchId}")
    public ResponseEntity<ApiResponse<RegistrationSummaryResponse>> getBatchSummary(@PathVariable UUID batchId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Batch summary retrieved successfully.",
                summaryService.getBatchSummary(batchId, role, userId)));
    }

    @GetMapping("/{batchId}/assessments")
    public ResponseEntity<ApiResponse<AssessmentWiseSummaryResponse>> getAssessmentWiseSummary(
            @PathVariable UUID batchId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Assessment-wise summary retrieved successfully.",
                        summaryService.getAssessmentWiseSummary(batchId, role, userId)));
    }

    @GetMapping("/{batchId}/status")
    public ResponseEntity<ApiResponse<RegistrationSummaryResponse>> getStatusWiseSummary(@PathVariable UUID batchId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Status-wise summary retrieved successfully.",
                        summaryService.getStatusWiseSummary(batchId, role, userId)));
    }
}
