package com.infy.registration.client;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Local mirror of the fields registration-service needs from user-service's
 * GET /students/{studentId}/status response. Deliberately not a shared
 * class — each service defines its own view of dependency data.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentStatusInfo {
    private UUID studentId;
    private UUID userId;
    private boolean active;
}
