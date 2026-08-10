package com.infy.registration.client;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Local mirror of the fields registration-service needs from
 * assessment-service's GET /assessments/{assessmentId} response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentInfo {
    private UUID assessmentId;
    private String status;
    private LocalDateTime startTime;
    private String scopeType;
    private UUID scopeId;
}
