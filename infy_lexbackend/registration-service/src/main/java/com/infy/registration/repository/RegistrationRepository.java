package com.infy.registration.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.registration.entity.Registration;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    /**
     * Backing query for duplicate-registration prevention (VR-009/BR-005) and
     * for locating the single row that cancel/re-register operate on.
     */
    Optional<Registration> findByStudentIdAndAssessmentId(UUID studentId, UUID assessmentId);

    List<Registration> findByStudentId(UUID studentId);

    /**
     * Bulk fetch used by summary-service's aggregation flow (a batch resolves
     * to a set of studentIds via user-service, then registrations for those
     * students are retrieved in one call).
     */
    List<Registration> findByStudentIdIn(Collection<UUID> studentIds);
}
