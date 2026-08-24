package com.passportsahayak.grievance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FileAppealRequest(
        @NotBlank String arn,
        @NotBlank @Size(max = 1000) String groundText
) {
}
