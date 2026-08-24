package com.passportsahayak.appointment.client;

/**
 * Mirrors the fields of application-service's ApplicationResponse that appointment-service
 * needs when validating a booking. Deliberately loose typing (String) to avoid a hard
 * compile-time coupling between the two services' enums.
 */
public record ApplicationView(
        Long id,
        String arn,
        String applicationType,
        String serviceScheme,
        boolean minor,
        String status,
        Long applicantUserId
) {
}
