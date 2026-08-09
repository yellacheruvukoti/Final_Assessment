package com.infy.registration.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.registration.enums.RegistrationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {
    private UUID registrationId;
    private UUID studentId;
    private UUID assessmentId;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime lastReactivatedAt;
    private String sourceChannel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
