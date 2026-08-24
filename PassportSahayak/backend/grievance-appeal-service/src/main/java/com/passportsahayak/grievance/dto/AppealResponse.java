package com.passportsahayak.grievance.dto;

import com.passportsahayak.grievance.entity.Appeal;
import com.passportsahayak.grievance.entity.AppealLevel;
import com.passportsahayak.grievance.entity.AppealStatus;

import java.time.Instant;

public record AppealResponse(
        Long id,
        String arn,
        AppealLevel level,
        AppealStatus status,
        String groundText,
        String decisionNotes,
        Instant decidedAt,
        Instant createdAt
) {
    public static AppealResponse from(Appeal a) {
        return new AppealResponse(a.getId(), a.getArn(), a.getLevel(), a.getStatus(), a.getGroundText(),
                a.getDecisionNotes(), a.getDecidedAt(), a.getCreatedAt());
    }
}
