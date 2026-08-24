package com.passportsahayak.grievance.dto;

import com.passportsahayak.grievance.entity.GrievanceStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateGrievanceStatusRequest(
        @NotNull GrievanceStatus status,
        String resolutionNotes
) {
}
