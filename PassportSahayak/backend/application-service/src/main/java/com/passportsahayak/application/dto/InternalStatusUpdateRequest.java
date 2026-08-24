package com.passportsahayak.application.dto;

import com.passportsahayak.application.entity.ApplicationStatus;
import com.passportsahayak.application.entity.PvType;
import jakarta.validation.constraints.NotNull;

public record InternalStatusUpdateRequest(
        @NotNull ApplicationStatus status,
        PvType pvType,
        String remarks
) {
}
