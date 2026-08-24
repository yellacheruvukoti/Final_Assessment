package com.passportsahayak.pv.client;

public record InternalStatusUpdateRequest(
        String status,
        String pvType,
        String remarks
) {
}
