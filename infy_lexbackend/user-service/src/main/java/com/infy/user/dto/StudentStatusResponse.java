package com.infy.user.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Backs the internal GET /students/{studentId}/status contract consumed by
 * registration-service and certification-service to validate a student
 * exists and is active (Student itself has no status field — activity is
 * derived from the linked User's status, per data-model.md 3.0/3.1).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentStatusResponse {
    private UUID studentId;
    private UUID userId;
    private boolean active;
}
