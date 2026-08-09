package com.infy.registration.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.registration.client.AssessmentInfo;
import com.infy.registration.client.AssessmentServiceClient;
import com.infy.registration.client.UserServiceClient;
import com.infy.registration.dto.RegistrationCreateRequest;
import com.infy.registration.dto.RegistrationResponse;
import com.infy.registration.entity.Registration;
import com.infy.registration.enums.RegistrationStatus;
import com.infy.registration.exception.BusinessException;
import com.infy.registration.mapper.RegistrationMapper;
import com.infy.registration.repository.RegistrationRepository;

import lombok.RequiredArgsConstructor;

/**
 * uk_student_assessment_active (Registration entity) permits exactly one row
 * per (studentId, assessmentId) for all time — register/cancel/re-register
 * therefore always operate on that single row rather than inserting a new
 * one per attempt (see Registration.java for the constraint rationale).
 */
@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserServiceClient userServiceClient;
    private final AssessmentServiceClient assessmentServiceClient;

    public RegistrationResponse register(RegistrationCreateRequest request) {
        UUID studentId = request.getStudentId();
        UUID assessmentId = request.getAssessmentId();

        if (!userServiceClient.isStudentActive(studentId)) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                    "Student not found or not active: " + studentId);
        }
        requireUpcomingAssessment(assessmentId);

        Registration registration = registrationRepository.findByStudentIdAndAssessmentId(studentId, assessmentId)
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        if (registration == null) {
            registration = Registration.builder()
                    .studentId(studentId)
                    .assessmentId(assessmentId)
                    .status(RegistrationStatus.REGISTERED)
                    .registeredAt(now)
                    .sourceChannel(request.getSourceChannel())
                    .build();
        } else if (registration.getStatus() == RegistrationStatus.REGISTERED) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_REGISTRATION",
                    "An active registration already exists for this student and assessment.");
        } else {
            // Previously CANCELLED: reactivate the same row (BR-006).
            registration.setStatus(RegistrationStatus.REGISTERED);
            registration.setLastReactivatedAt(now);
        }

        return RegistrationMapper.toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse cancel(UUID registrationId) {
        Registration registration = findRegistrationOrThrow(registrationId);
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new BusinessException(HttpStatus.CONFLICT, "REGISTRATION_CANCELLED",
                    "Registration is already cancelled.");
        }
        requireUpcomingAssessment(registration.getAssessmentId());

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now());
        return RegistrationMapper.toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse reregister(UUID registrationId) {
        Registration registration = findRegistrationOrThrow(registrationId);
        if (registration.getStatus() == RegistrationStatus.REGISTERED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR",
                    "Registration is already active.");
        }
        requireUpcomingAssessment(registration.getAssessmentId());

        registration.setStatus(RegistrationStatus.REGISTERED);
        registration.setLastReactivatedAt(LocalDateTime.now());
        return RegistrationMapper.toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse getRegistration(UUID registrationId) {
        return RegistrationMapper.toResponse(findRegistrationOrThrow(registrationId));
    }

    public List<RegistrationResponse> getStudentRegistrations(UUID studentId) {
        return registrationRepository.findByStudentId(studentId).stream()
                .map(RegistrationMapper::toResponse)
                .toList();
    }

    /**
     * Internal contract (not gateway-routed) consumed by summary-service.
     */
    public List<RegistrationResponse> getRegistrationsByStudentIds(List<UUID> studentIds) {
        return registrationRepository.findByStudentIdIn(studentIds).stream()
                .map(RegistrationMapper::toResponse)
                .toList();
    }

    private void requireUpcomingAssessment(UUID assessmentId) {
        AssessmentInfo assessment = assessmentServiceClient.getAssessment(assessmentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ASSESSMENT_NOT_FOUND",
                        "Assessment not found for id " + assessmentId));

        if (!"PUBLISHED".equals(assessment.getStatus())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "ASSESSMENT_NOT_UPCOMING",
                    "Assessment is not eligible for registration because it is not published.");
        }
        if (!assessment.getStartTime().isAfter(LocalDateTime.now())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "ASSESSMENT_ALREADY_STARTED",
                    "Assessment start time has passed or started.");
        }
    }

    private Registration findRegistrationOrThrow(UUID registrationId) {
        return registrationRepository.findById(registrationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "REGISTRATION_NOT_FOUND",
                        "Registration not found for id " + registrationId));
    }
}
