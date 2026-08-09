package com.infy.certification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.certification.enums.CertificateStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * General-visibility certificate view. downloadToken is deliberately
 * excluded here — it is only revealed via CertificateDownloadResponse to the
 * owning student (api-contract.md Section 16: download is "Student self
 * only").
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateResponse {
    private UUID certificateId;
    private UUID studentId;
    private UUID assessmentId;
    private UUID courseId;
    private Double score;
    private CertificateStatus status;
    private LocalDateTime issuedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
