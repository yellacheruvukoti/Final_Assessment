package com.passportsahayak.appointment.client;

public record InternalStatusUpdateRequest(
        String status,
        String pvType,
        String remarks
) {
}
