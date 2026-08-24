package com.passportsahayak.fraud.dto;

import com.passportsahayak.fraud.entity.EscalationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateEscalationStatusRequest(
        @NotNull EscalationStatus status
) {
}
