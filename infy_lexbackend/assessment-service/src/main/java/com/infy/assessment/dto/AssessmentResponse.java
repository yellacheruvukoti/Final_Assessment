package com.infy.assessment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.assessment.enums.AssessmentStatus;
import com.infy.assessment.enums.ScopeType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResponse {
    private UUID assessmentId;
    private String assessmentCode;
    private String title;
    private String description;
    private AssessmentStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private ScopeType scopeType;
    private UUID scopeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
