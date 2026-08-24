package com.passportsahayak.pv.dto;

import com.passportsahayak.pv.entity.PoliceVerificationCase;
import com.passportsahayak.pv.entity.PvCaseStatus;
import com.passportsahayak.pv.entity.PvType;

import java.time.Instant;
import java.time.LocalDate;

public record PvCaseResponse(
        Long id,
        String arn,
        PvType pvType,
        PvCaseStatus status,
        String district,
        String state,
        Instant dispatchedAt,
        LocalDate slaDeadline,
        Instant clearedAt,
        String remarks,
        String applicantAction,
        Instant updatedAt
) {
    public static PvCaseResponse from(PoliceVerificationCase c, String applicantAction) {
        return new PvCaseResponse(c.getId(), c.getArn(), c.getPvType(), c.getStatus(), c.getDistrict(), c.getState(),
                c.getDispatchedAt(), c.getSlaDeadline(), c.getClearedAt(), c.getRemarks(), applicantAction, c.getUpdatedAt());
    }
}
