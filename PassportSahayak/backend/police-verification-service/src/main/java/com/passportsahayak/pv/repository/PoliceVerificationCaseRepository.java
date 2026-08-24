package com.passportsahayak.pv.repository;

import com.passportsahayak.pv.entity.PoliceVerificationCase;
import com.passportsahayak.pv.entity.PvCaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PoliceVerificationCaseRepository extends JpaRepository<PoliceVerificationCase, Long> {
    Optional<PoliceVerificationCase> findByArn(String arn);
    boolean existsByArn(String arn);
    Page<PoliceVerificationCase> findByStatus(PvCaseStatus status, Pageable pageable);
    List<PoliceVerificationCase> findBySlaDeadlineBeforeAndStatusNotInAndStatusNot(
            LocalDate date, List<PvCaseStatus> excluded, PvCaseStatus overdue);
}
