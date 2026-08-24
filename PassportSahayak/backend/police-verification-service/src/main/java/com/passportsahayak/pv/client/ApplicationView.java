package com.passportsahayak.pv.client;

public record ApplicationView(
        Long id,
        String arn,
        String applicationType,
        boolean minor,
        String status,
        Long applicantUserId
) {
}
