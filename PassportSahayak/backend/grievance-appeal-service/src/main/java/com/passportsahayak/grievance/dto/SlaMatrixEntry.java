package com.passportsahayak.grievance.dto;

public record SlaMatrixEntry(
        String grievanceType,
        String primaryChannel,
        int slaWorkingDays,
        String escalation
) {
}
