package com.passportsahayak.application.dto;

import java.math.BigDecimal;

public record FeeEstimateResponse(
        BigDecimal feeAmount,
        String breakdown
) {
}
