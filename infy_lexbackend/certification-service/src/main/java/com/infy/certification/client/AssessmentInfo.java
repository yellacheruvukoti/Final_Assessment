package com.infy.certification.client;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Local mirror of the fields certification-service needs from
 * assessment-service. Used to validate the assessment exists and confirm
 * completion status (see the score-source design note on
 * CertificateIssueRequest — assessment-service has no score to return).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentInfo {
    private UUID assessmentId;
    private String status;
}
