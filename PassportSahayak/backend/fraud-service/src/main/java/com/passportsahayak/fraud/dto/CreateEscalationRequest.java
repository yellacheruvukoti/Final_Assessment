package com.passportsahayak.fraud.dto;

import com.passportsahayak.fraud.entity.EscalationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateEscalationRequest(
        @NotBlank String arn,
        @NotNull EscalationType type,
        @NotBlank String details
) {
}
