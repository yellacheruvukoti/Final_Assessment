package com.infy.assessment.mapper;

import com.infy.assessment.dto.AssessmentCreateRequest;
import com.infy.assessment.dto.AssessmentResponse;
import com.infy.assessment.dto.AssessmentUpdateRequest;
import com.infy.assessment.entity.Assessment;

public final class AssessmentMapper {

    private AssessmentMapper() {
    }

    public static AssessmentResponse toResponse(Assessment assessment) {
        return AssessmentResponse.builder()
                .assessmentId(assessment.getAssessmentId())
                .assessmentCode(assessment.getAssessmentCode())
                .title(assessment.getTitle())
                .description(assessment.getDescription())
                .status(assessment.getStatus())
                .startTime(assessment.getStartTime())
                .endTime(assessment.getEndTime())
                .durationMinutes(assessment.getDurationMinutes())
                .scopeType(assessment.getScopeType())
                .scopeId(assessment.getScopeId())
                .createdAt(assessment.getCreatedAt())
                .updatedAt(assessment.getUpdatedAt())
                .build();
    }

    public static Assessment toEntity(AssessmentCreateRequest request) {
        return Assessment.builder()
                .assessmentCode(request.getAssessmentCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .scopeType(request.getScopeType())
                .scopeId(request.getScopeId())
                .build();
    }

    public static void applyUpdate(Assessment assessment, AssessmentUpdateRequest request) {
        assessment.setTitle(request.getTitle());
        assessment.setDescription(request.getDescription());
        assessment.setStatus(request.getStatus());
        assessment.setStartTime(request.getStartTime());
        assessment.setEndTime(request.getEndTime());
        assessment.setDurationMinutes(request.getDurationMinutes());
    }
}
