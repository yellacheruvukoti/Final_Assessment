package com.infy.certification.dto;

import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Score is caller-supplied: no entity in the approved data model (Assessment,
 * Quiz, or otherwise) stores a per-student assessment result, so
 * assessment-service has no score to hand back to certification-service.
 * api-contract.md frames issuance as "Student (self-triggered after
 * evaluation)" — evaluation happens outside this system's modeled boundary,
 * and this field is where its outcome enters. Structural range validation
 * (0-100) happens here; the score >= 60 business threshold is enforced in
 * the service layer (TASK-014), which is configurable and distinct from
 * "is this a valid percentage at all."
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateIssueRequest {

    @NotNull
    private UUID studentId;

    @NotNull
    private UUID assessmentId;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double score;
}
