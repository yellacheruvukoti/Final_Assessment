package com.passportsahayak.grievance.dto;

import com.passportsahayak.grievance.entity.GrievanceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FileGrievanceRequest(
        String arn,
        @NotNull GrievanceType type,
        @NotBlank @Size(max = 1000) String description
) {
}
