package com.passportsahayak.fraud.dto;

import com.passportsahayak.fraud.entity.EscalationCase;
import com.passportsahayak.fraud.entity.EscalationStatus;
import com.passportsahayak.fraud.entity.EscalationType;

import java.time.Instant;

public record EscalationCaseResponse(
        Long id,
        String arn,
        EscalationType type,
        String details,
        EscalationStatus status,
        Instant createdAt
) {
    public static EscalationCaseResponse from(EscalationCase c) {
        return new EscalationCaseResponse(c.getId(), c.getArn(), c.getType(), c.getDetails(), c.getStatus(), c.getCreatedAt());
    }
}
