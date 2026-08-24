package com.passportsahayak.fraud.repository;

import com.passportsahayak.fraud.entity.FraudReport;
import com.passportsahayak.fraud.entity.FraudReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FraudReportRepository extends JpaRepository<FraudReport, Long> {
    List<FraudReport> findByReportedByUserIdOrderByCreatedAtDesc(Long reportedByUserId);
    Page<FraudReport> findByStatus(FraudReportStatus status, Pageable pageable);
}
