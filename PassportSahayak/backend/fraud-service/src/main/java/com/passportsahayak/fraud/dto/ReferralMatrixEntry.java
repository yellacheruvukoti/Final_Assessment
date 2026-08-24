package com.passportsahayak.fraud.dto;

public record ReferralMatrixEntry(
        String category,
        String severity,
        String referralAuthority,
        String outcome
) {
}
