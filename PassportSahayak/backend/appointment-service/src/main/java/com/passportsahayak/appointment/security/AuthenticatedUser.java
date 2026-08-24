package com.passportsahayak.appointment.security;

public record AuthenticatedUser(
        Long userId,
        String email,
        String fullName,
        String phone,
        String role
) {
}
