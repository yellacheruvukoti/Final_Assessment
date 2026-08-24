package com.passportsahayak.fraud.dto;

import com.passportsahayak.fraud.entity.FraudCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FileFraudReportRequest(
        String arn,
        @NotNull FraudCategory category,
        @NotBlank @Size(max = 1500) String description
) {
}
