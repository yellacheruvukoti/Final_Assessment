package com.passportsahayak.pv.dto;

import com.passportsahayak.pv.entity.PvCaseStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePvCaseStatusRequest(
        @NotNull PvCaseStatus status,
        String remarks
) {
}
