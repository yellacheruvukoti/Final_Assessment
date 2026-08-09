package com.infy.certification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

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
public class CertificateDownloadResponse {
    private UUID certificateId;
    private UUID studentId;
    private UUID assessmentId;
    private UUID courseId;
    private Double score;
    private LocalDateTime issuedAt;
    private String downloadToken;
}
