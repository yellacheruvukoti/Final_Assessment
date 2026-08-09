package com.infy.certification.mapper;

import com.infy.certification.dto.CertificateDownloadResponse;
import com.infy.certification.dto.CertificateResponse;
import com.infy.certification.entity.Certificate;

public final class CertificateMapper {

    private CertificateMapper() {
    }

    public static CertificateResponse toResponse(Certificate certificate) {
        return CertificateResponse.builder()
                .certificateId(certificate.getCertificateId())
                .studentId(certificate.getStudentId())
                .assessmentId(certificate.getAssessmentId())
                .courseId(certificate.getCourseId())
                .score(certificate.getScore())
                .status(certificate.getStatus())
                .issuedAt(certificate.getIssuedAt())
                .createdAt(certificate.getCreatedAt())
                .updatedAt(certificate.getUpdatedAt())
                .build();
    }

    public static CertificateDownloadResponse toDownloadResponse(Certificate certificate) {
        return CertificateDownloadResponse.builder()
                .certificateId(certificate.getCertificateId())
                .studentId(certificate.getStudentId())
                .assessmentId(certificate.getAssessmentId())
                .courseId(certificate.getCourseId())
                .score(certificate.getScore())
                .issuedAt(certificate.getIssuedAt())
                .downloadToken(certificate.getDownloadToken())
                .build();
    }
}
