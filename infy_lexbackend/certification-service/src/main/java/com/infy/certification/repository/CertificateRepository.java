package com.infy.certification.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.certification.entity.Certificate;
import com.infy.certification.enums.CertificateStatus;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {

    /**
     * Backing query for the one-certificate-per-student-per-assessment rule
     * (clarification.md Section 13).
     */
    Optional<Certificate> findByStudentIdAndAssessmentId(UUID studentId, UUID assessmentId);

    List<Certificate> findByStudentId(UUID studentId);

    Optional<Certificate> findByDownloadToken(String downloadToken);

    List<Certificate> findByScoreGreaterThanEqual(Double score);

    List<Certificate> findByStatus(CertificateStatus status);
}
