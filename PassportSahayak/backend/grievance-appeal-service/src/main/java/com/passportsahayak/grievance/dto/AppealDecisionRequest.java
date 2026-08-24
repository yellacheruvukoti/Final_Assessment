package com.passportsahayak.grievance.dto;

import com.passportsahayak.grievance.entity.AppealStatus;
import jakarta.validation.constraints.NotNull;

public record AppealDecisionRequest(
        @NotNull AppealStatus status,
        String decisionNotes
) {
}
