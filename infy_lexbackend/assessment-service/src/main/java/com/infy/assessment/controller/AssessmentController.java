package com.infy.assessment.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.assessment.dto.ApiResponse;
import com.infy.assessment.dto.AssessmentCreateRequest;
import com.infy.assessment.dto.AssessmentResponse;
import com.infy.assessment.dto.AssessmentUpdateRequest;
import com.infy.assessment.enums.AssessmentStatus;
import com.infy.assessment.service.AssessmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssessmentResponse>>> listAssessments(
            @RequestParam(required = false) AssessmentStatus status) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Assessments retrieved successfully.",
                        assessmentService.listAssessments(status)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<AssessmentResponse>>> listUpcoming() {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Upcoming assessments retrieved successfully.",
                        assessmentService.listUpcoming()));
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<ApiResponse<AssessmentResponse>> getAssessment(@PathVariable UUID assessmentId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Assessment retrieved successfully.",
                        assessmentService.getAssessment(assessmentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssessmentResponse>> createAssessment(
            @Valid @RequestBody AssessmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assessment created successfully.",
                        assessmentService.createAssessment(request)));
    }

    @PutMapping("/{assessmentId}")
    public ResponseEntity<ApiResponse<AssessmentResponse>> updateAssessment(@PathVariable UUID assessmentId,
            @Valid @RequestBody AssessmentUpdateRequest request) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Assessment updated successfully.",
                        assessmentService.updateAssessment(assessmentId, request)));
    }
}
