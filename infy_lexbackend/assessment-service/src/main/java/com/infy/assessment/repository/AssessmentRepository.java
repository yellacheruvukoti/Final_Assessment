package com.infy.assessment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.assessment.entity.Assessment;
import com.infy.assessment.enums.AssessmentStatus;

public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {

    Optional<Assessment> findByAssessmentCode(String assessmentCode);

    List<Assessment> findByStatus(AssessmentStatus status);

    /**
     * Upcoming per AS-004 / clarification.md Section 2: status is PUBLISHED
     * and the current timestamp is before startTime.
     */
    List<Assessment> findByStatusAndStartTimeAfter(AssessmentStatus status, LocalDateTime now);
}
