package com.passportsahayak.grievance.dto;

import com.passportsahayak.grievance.entity.Grievance;
import com.passportsahayak.grievance.entity.GrievanceStatus;
import com.passportsahayak.grievance.entity.GrievanceType;

import java.time.Instant;

public record GrievanceResponse(
        Long id,
        String arn,
        GrievanceType type,
        GrievanceStatus status,
        int slaWorkingDays,
        String description,
        String resolutionNotes,
        Instant createdAt,
        Instant resolvedAt
) {
    public static GrievanceResponse from(Grievance g) {
        return new GrievanceResponse(g.getId(), g.getArn(), g.getType(), g.getStatus(), g.getSlaWorkingDays(),
                g.getDescription(), g.getResolutionNotes(), g.getCreatedAt(), g.getResolvedAt());
    }
}
