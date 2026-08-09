package com.infy.summary.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.summary.entity.RegistrationSummaryView;

public interface RegistrationSummaryViewRepository extends JpaRepository<RegistrationSummaryView, String> {

    List<RegistrationSummaryView> findByBatchId(UUID batchId);

    Optional<RegistrationSummaryView> findByBatchIdAndAssessmentId(UUID batchId, UUID assessmentId);
}
