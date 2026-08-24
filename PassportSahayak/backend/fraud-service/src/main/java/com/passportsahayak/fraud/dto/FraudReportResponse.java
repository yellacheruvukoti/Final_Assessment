package com.passportsahayak.fraud.dto;

import com.passportsahayak.fraud.entity.FraudCategory;
import com.passportsahayak.fraud.entity.FraudReport;
import com.passportsahayak.fraud.entity.FraudReportStatus;

import java.time.Instant;

public record FraudReportResponse(
        Long id,
        String arn,
        FraudCategory category,
        String severity,
        String referralAuthority,
        String description,
        FraudReportStatus status,
        Instant createdAt
) {
    public static FraudReportResponse from(FraudReport r) {
        return new FraudReportResponse(r.getId(), r.getArn(), r.getCategory(), r.getSeverity(),
                r.getReferralAuthority(), r.getDescription(), r.getStatus(), r.getCreatedAt());
    }
}
