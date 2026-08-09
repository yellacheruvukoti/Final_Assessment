package com.infy.registration.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.registration.client.AssessmentInfo;
import com.infy.registration.client.AssessmentServiceClient;
import com.infy.registration.client.UserServiceClient;
import com.infy.registration.dto.RegistrationCreateRequest;
import com.infy.registration.entity.Registration;
import com.infy.registration.enums.RegistrationStatus;
import com.infy.registration.exception.BusinessException;
import com.infy.registration.repository.RegistrationRepository;

/**
 * Registration lifecycle test suite (FR-008..FR-011, BR-005/BR-006,
 * VR-008/VR-009). Self-defined test case IDs — test.md is empty.
 */
@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private UserServiceClient userServiceClient;
    @Mock
    private AssessmentServiceClient assessmentServiceClient;

    @InjectMocks
    private RegistrationService registrationService;

    private final UUID studentId = UUID.randomUUID();
    private final UUID assessmentId = UUID.randomUUID();

    private AssessmentInfo upcomingAssessment() {
        return AssessmentInfo.builder()
                .assessmentId(assessmentId)
                .status("PUBLISHED")
                .startTime(LocalDateTime.now().plusDays(1))
                .build();
    }

    @Test
    void tcReg001_register_newRegistration_succeeds() {
        RegistrationCreateRequest request = RegistrationCreateRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).sourceChannel("WEB").build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId)).thenReturn(Optional.of(upcomingAssessment()));
        when(registrationRepository.findByStudentIdAndAssessmentId(studentId, assessmentId)).thenReturn(Optional.empty());
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = registrationService.register(request);

        assertThat(response.getStatus()).isEqualTo(RegistrationStatus.REGISTERED);
    }

    @Test
    void tcReg002_register_existingActiveRegistration_throwsDuplicate() {
        RegistrationCreateRequest request = RegistrationCreateRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).build();
        Registration existing = Registration.builder().status(RegistrationStatus.REGISTERED).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId)).thenReturn(Optional.of(upcomingAssessment()));
        when(registrationRepository.findByStudentIdAndAssessmentId(studentId, assessmentId)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> registrationService.register(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("DUPLICATE_REGISTRATION"));
    }

    @Test
    void tcReg003_register_inactiveStudent_throwsStudentNotFound() {
        RegistrationCreateRequest request = RegistrationCreateRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(false);

        assertThatThrownBy(() -> registrationService.register(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("STUDENT_NOT_FOUND"));
    }

    @Test
    void tcReg004_register_assessmentNotPublished_throwsNotUpcoming() {
        RegistrationCreateRequest request = RegistrationCreateRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).build();
        AssessmentInfo draft = AssessmentInfo.builder().assessmentId(assessmentId).status("DRAFT")
                .startTime(LocalDateTime.now().plusDays(1)).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> registrationService.register(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("ASSESSMENT_NOT_UPCOMING"));
    }

    @Test
    void tcReg005_register_assessmentAlreadyStarted_throwsAlreadyStarted() {
        RegistrationCreateRequest request = RegistrationCreateRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).build();
        AssessmentInfo started = AssessmentInfo.builder().assessmentId(assessmentId).status("PUBLISHED")
                .startTime(LocalDateTime.now().minusMinutes(5)).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId)).thenReturn(Optional.of(started));

        assertThatThrownBy(() -> registrationService.register(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("ASSESSMENT_ALREADY_STARTED"));
    }

    @Test
    void tcReg006_cancel_activeRegistration_setsCancelled() {
        UUID registrationId = UUID.randomUUID();
        Registration registration = Registration.builder()
                .registrationId(registrationId).assessmentId(assessmentId).status(RegistrationStatus.REGISTERED).build();
        when(registrationRepository.findById(registrationId)).thenReturn(Optional.of(registration));
        when(assessmentServiceClient.getAssessment(assessmentId)).thenReturn(Optional.of(upcomingAssessment()));
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = registrationService.cancel(registrationId);

        assertThat(response.getStatus()).isEqualTo(RegistrationStatus.CANCELLED);
        assertThat(response.getCancelledAt()).isNotNull();
    }

    @Test
    void tcReg007_cancel_alreadyCancelled_throwsRegistrationCancelled() {
        UUID registrationId = UUID.randomUUID();
        Registration registration = Registration.builder()
                .registrationId(registrationId).status(RegistrationStatus.CANCELLED).build();
        when(registrationRepository.findById(registrationId)).thenReturn(Optional.of(registration));

        assertThatThrownBy(() -> registrationService.cancel(registrationId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("REGISTRATION_CANCELLED"));
    }

    @Test
    void tcReg008_reregister_cancelledRegistration_reactivates() {
        UUID registrationId = UUID.randomUUID();
        Registration registration = Registration.builder()
                .registrationId(registrationId).assessmentId(assessmentId).status(RegistrationStatus.CANCELLED).build();
        when(registrationRepository.findById(registrationId)).thenReturn(Optional.of(registration));
        when(assessmentServiceClient.getAssessment(assessmentId)).thenReturn(Optional.of(upcomingAssessment()));
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = registrationService.reregister(registrationId);

        assertThat(response.getStatus()).isEqualTo(RegistrationStatus.REGISTERED);
        assertThat(response.getLastReactivatedAt()).isNotNull();
    }

    @Test
    void tcReg009_register_previouslyCancelled_reactivatesSameRow() {
        RegistrationCreateRequest request = RegistrationCreateRequest.builder()
                .studentId(studentId).assessmentId(assessmentId).build();
        UUID registrationId = UUID.randomUUID();
        Registration cancelled = Registration.builder()
                .registrationId(registrationId).studentId(studentId).assessmentId(assessmentId)
                .status(RegistrationStatus.CANCELLED).build();
        when(userServiceClient.isStudentActive(studentId)).thenReturn(true);
        when(assessmentServiceClient.getAssessment(assessmentId)).thenReturn(Optional.of(upcomingAssessment()));
        when(registrationRepository.findByStudentIdAndAssessmentId(studentId, assessmentId)).thenReturn(Optional.of(cancelled));
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = registrationService.register(request);

        assertThat(response.getRegistrationId()).isEqualTo(registrationId);
        assertThat(response.getStatus()).isEqualTo(RegistrationStatus.REGISTERED);
    }
}
