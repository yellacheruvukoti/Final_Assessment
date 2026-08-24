package com.passportsahayak.application.repository;

import com.passportsahayak.application.entity.ApplicationStatus;
import com.passportsahayak.application.entity.PassportApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PassportApplicationRepository extends JpaRepository<PassportApplication, Long> {
    Optional<PassportApplication> findByArn(String arn);
    boolean existsByArn(String arn);
    List<PassportApplication> findByApplicantUserIdOrderByCreatedAtDesc(Long applicantUserId);
    Page<PassportApplication> findByStatus(ApplicationStatus status, Pageable pageable);
}
