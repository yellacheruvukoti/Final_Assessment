package com.infy.certification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.certification.client.AssessmentServiceClient;
import com.infy.certification.client.UserServiceClient;
import com.infy.certification.config.CertificationProperties;
import com.infy.certification.dto.CertificateDownloadResponse;
import com.infy.certification.dto.CertificateIssueRequest;
import com.infy.certification.dto.CertificateResponse;
import com.infy.certification.entity.Certificate;
import com.infy.certification.enums.CertificateStatus;
import com.infy.certification.exception.BusinessException;
import com.infy.certification.mapper.CertificateMapper;
import com.infy.certification.repository.CertificateRepository;

import lombok.RequiredArgsConstructor;

/**
 * Certificate issuance and lifecycle (FR-019, clarification.md Section 13):
 * minimum 60 percent score, one certificate per student per assessment,
 * secure download token, Administrator-only revocation.
 */
@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserServiceClient userServiceClient;
    private final AssessmentServiceClient assessmentServiceClient;
    private final CertificationProperties certificationProperties;

    public CertificateResponse issueCertificate(CertificateIssueRequest request) {
        UUID studentId = request.getStudentId();
        UUID assessmentId = request.getAssessmentId();

        if (!userServiceClient.isStudentActive(studentId)) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                    "Student not found or not active: " + studentId);
        }
        assessmentServiceClient.getAssessment(assessmentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ASSESSMENT_NOT_FOUND",
                        "Assessment not found for id " + assessmentId));

        if (request.getScore() == null || request.getScore() < certificationProperties.getScoreThreshold()) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "SCORE_BELOW_THRESHOLD",
                    "Score must be at least " + certificationProperties.getScoreThreshold()
                            + " percent to issue a certificate.");
        }

        certificateRepository.findByStudentIdAndAssessmentId(studentId, assessmentId).ifPresent(existing -> {
            throw new BusinessException(HttpStatus.CONFLICT, "CERTIFICATE_ALREADY_ISSUED",
                    "A certificate already exists for this student and assessment.");
        });

        Certificate certificate = Certificate.builder()
                .studentId(studentId)
                .assessmentId(assessmentId)
                .score(request.getScore())
                .status(CertificateStatus.ISSUED)
                .issuedAt(LocalDateTime.now())
                .downloadToken(certificationProperties.getDownloadTokenPrefix() + UUID.randomUUID())
                .build();

        return CertificateMapper.toResponse(certificateRepository.save(certificate));
    }

    public CertificateResponse getCertificate(UUID certificateId) {
        return CertificateMapper.toResponse(findCertificateOrThrow(certificateId));
    }

    public CertificateDownloadResponse downloadCertificate(UUID certificateId) {
        Certificate certificate = findCertificateOrThrow(certificateId);
        if (certificate.getStatus() != CertificateStatus.ISSUED) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "CERTIFICATE_NOT_FOUND",
                    "Certificate is not available for download.");
        }
        return CertificateMapper.toDownloadResponse(certificate);
    }

    public List<CertificateResponse> listByStudent(UUID studentId) {
        return certificateRepository.findByStudentId(studentId).stream()
                .map(CertificateMapper::toResponse)
                .toList();
    }

    public List<CertificateResponse> listCertificates(CertificateStatus statusFilter) {
        List<Certificate> certificates = statusFilter == null
                ? certificateRepository.findAll()
                : certificateRepository.findByStatus(statusFilter);
        return certificates.stream().map(CertificateMapper::toResponse).toList();
    }

    public CertificateResponse revokeCertificate(UUID certificateId) {
        Certificate certificate = findCertificateOrThrow(certificateId);
        certificate.setStatus(CertificateStatus.REVOKED);
        return CertificateMapper.toResponse(certificateRepository.save(certificate));
    }

    private Certificate findCertificateOrThrow(UUID certificateId) {
        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CERTIFICATE_NOT_FOUND",
                        "Certificate not found for id " + certificateId));
    }
}
