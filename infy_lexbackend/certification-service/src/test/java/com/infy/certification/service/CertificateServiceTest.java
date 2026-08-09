package com.infy.certification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.certification.client.AssessmentInfo;
import com.infy.certification.client.AssessmentServiceClient;
import com.infy.certification.client.UserServiceClient;
import com.infy.certification.config.CertificationProperties;
import com.infy.certification.dto.CertificateIssueRequest;
import com.infy.certification.entity.Certificate;
import com.infy.certification.enums.CertificateStatus;
import com.infy.certification.exception.BusinessException;
import com.infy.certification.repository.CertificateRepository;

/**
 * Certificate issuance and lifecycle (FR-019, clarification.md Section 13).
 * Self-defined test case IDs — test.md is empty.
 */
@ExtendWith(MockitoExtension.class)
class CertificateServiceTest {

    @Mock
    private CertificateRepository certificateRepository;
    @Mock
    private UserServiceClient userServiceClient;
    @Mock
    private AssessmentServiceClient assessmentServiceClient;

    private CertificationProperties certificationProperties;

    private CertificateService certificateService;

    private final UUID studentId = UUID.randomUUID();
    private final UUID assessmentId = UUID.randomUUID();

    private void initService() {
        certificationProperties = new CertificationProperties();
        certificationProperties.setScoreThreshold(60.0);
        certificationProperties.setDownloadTokenPrefix("dlt-");
        certificateService = new CertificateService(certificateRepository, userServiceClient,
                assessmentServiceClient, certificationProperties);
    }

    @Test
    void tcCert001_issueCertificate_scoreAboveThreshold_succeeds() {
        initService();
        CertificateIssueRequest request = CertificateIssueRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).score(85.0).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId))
                .thenReturn(Optional.of(AssessmentInfo.builder().assessmentId(assessmentId).status("CLOSED").build()));
        when(certificateRepository.findByStudentIdAndAssessmentId(studentId, assessmentId)).thenReturn(Optional.empty());
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = certificateService.issueCertificate(request);

        assertThat(response.getStatus()).isEqualTo(CertificateStatus.ISSUED);
        assertThat(response.getScore()).isEqualTo(85.0);
    }

    @Test
    void tcCert002_issueCertificate_scoreExactlyAtThreshold_succeeds() {
        initService();
        CertificateIssueRequest request = CertificateIssueRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).score(60.0).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId))
                .thenReturn(Optional.of(AssessmentInfo.builder().assessmentId(assessmentId).status("CLOSED").build()));
        when(certificateRepository.findByStudentIdAndAssessmentId(studentId, assessmentId)).thenReturn(Optional.empty());
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = certificateService.issueCertificate(request);

        assertThat(response.getStatus()).isEqualTo(CertificateStatus.ISSUED);
    }

    @Test
    void tcCert003_issueCertificate_scoreBelowThreshold_throwsScoreBelowThreshold() {
        initService();
        CertificateIssueRequest request = CertificateIssueRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).score(45.0).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId))
                .thenReturn(Optional.of(AssessmentInfo.builder().assessmentId(assessmentId).status("CLOSED").build()));

        assertThatThrownBy(() -> certificateService.issueCertificate(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("SCORE_BELOW_THRESHOLD"));
    }

    @Test
    void tcCert004_issueCertificate_duplicateForSameStudentAssessment_throwsAlreadyIssued() {
        initService();
        CertificateIssueRequest request = CertificateIssueRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).score(90.0).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId))
                .thenReturn(Optional.of(AssessmentInfo.builder().assessmentId(assessmentId).status("CLOSED").build()));
        when(certificateRepository.findByStudentIdAndAssessmentId(studentId, assessmentId))
                .thenReturn(Optional.of(Certificate.builder().status(CertificateStatus.ISSUED).build()));

        assertThatThrownBy(() -> certificateService.issueCertificate(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("CERTIFICATE_ALREADY_ISSUED"));
    }

    @Test
    void tcCert005_issueCertificate_generatesDownloadTokenWithConfiguredPrefix() {
        initService();
        CertificateIssueRequest request = CertificateIssueRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).score(90.0).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId))
                .thenReturn(Optional.of(AssessmentInfo.builder().assessmentId(assessmentId).status("CLOSED").build()));
        when(certificateRepository.findByStudentIdAndAssessmentId(studentId, assessmentId)).thenReturn(Optional.empty());
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = certificateService.issueCertificate(request);
        var download = certificateService.downloadCertificate(fakeStoredCertificateId(response));

        assertThat(download.getDownloadToken()).startsWith("dlt-");
    }

    private UUID fakeStoredCertificateId(com.infy.certification.dto.CertificateResponse issued) {
        UUID certificateId = UUID.randomUUID();
        when(certificateRepository.findById(certificateId)).thenReturn(Optional.of(Certificate.builder()
                .certificateId(certificateId)
                .studentId(issued.getStudentId())
                .assessmentId(issued.getAssessmentId())
                .score(issued.getScore())
                .status(CertificateStatus.ISSUED)
                .issuedAt(LocalDateTime.now())
                .downloadToken("dlt-" + UUID.randomUUID())
                .build()));
        return certificateId;
    }

    @Test
    void tcCert006_downloadCertificate_revokedStatus_throwsCertificateNotFound() {
        initService();
        UUID certificateId = UUID.randomUUID();
        when(certificateRepository.findById(certificateId)).thenReturn(Optional.of(
                Certificate.builder().certificateId(certificateId).status(CertificateStatus.REVOKED).build()));

        assertThatThrownBy(() -> certificateService.downloadCertificate(certificateId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("CERTIFICATE_NOT_FOUND"));
    }

    @Test
    void tcCert007_revokeCertificate_setsRevokedStatus() {
        initService();
        UUID certificateId = UUID.randomUUID();
        Certificate certificate = Certificate.builder().certificateId(certificateId).status(CertificateStatus.ISSUED).build();
        when(certificateRepository.findById(certificateId)).thenReturn(Optional.of(certificate));
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = certificateService.revokeCertificate(certificateId);

        assertThat(response.getStatus()).isEqualTo(CertificateStatus.REVOKED);
    }
}
