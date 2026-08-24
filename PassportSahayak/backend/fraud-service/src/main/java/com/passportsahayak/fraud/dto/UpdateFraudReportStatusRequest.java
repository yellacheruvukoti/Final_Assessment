package com.passportsahayak.fraud.dto;

import com.passportsahayak.fraud.entity.FraudReportStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateFraudReportStatusRequest(
        @NotNull FraudReportStatus status
) {
}
