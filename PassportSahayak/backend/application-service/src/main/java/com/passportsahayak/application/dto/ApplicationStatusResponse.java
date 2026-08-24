package com.passportsahayak.application.dto;

import com.passportsahayak.application.entity.ApplicationStatus;
import com.passportsahayak.application.entity.PvType;

import java.time.Instant;

public record ApplicationStatusResponse(
        String arn,
        ApplicationStatus status,
        PvType pvType,
        String applicantNextStep,
        Instant updatedAt
) {
}
