package com.infy.assessment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.assessment.enums.AssessmentStatus;
import com.infy.assessment.enums.ScopeType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class AssessmentCreateRequest {

    @NotBlank
    @Size(min = 3, max = 40)
    private String assessmentCode;

    @NotBlank
    @Size(min = 3, max = 150)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull
    private AssessmentStatus status;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @NotNull
    @Positive
    private Integer durationMinutes;

    @NotNull
    private ScopeType scopeType;

    @NotNull
    private UUID scopeId;
}
