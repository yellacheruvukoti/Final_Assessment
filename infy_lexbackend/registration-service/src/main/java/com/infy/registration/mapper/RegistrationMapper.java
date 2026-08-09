package com.infy.registration.mapper;

import com.infy.registration.dto.RegistrationResponse;
import com.infy.registration.entity.Registration;

public final class RegistrationMapper {

    private RegistrationMapper() {
    }

    public static RegistrationResponse toResponse(Registration registration) {
        return RegistrationResponse.builder()
                .registrationId(registration.getRegistrationId())
                .studentId(registration.getStudentId())
                .assessmentId(registration.getAssessmentId())
                .status(registration.getStatus())
                .registeredAt(registration.getRegisteredAt())
                .cancelledAt(registration.getCancelledAt())
                .lastReactivatedAt(registration.getLastReactivatedAt())
                .sourceChannel(registration.getSourceChannel())
                .createdAt(registration.getCreatedAt())
                .updatedAt(registration.getUpdatedAt())
                .build();
    }
}
