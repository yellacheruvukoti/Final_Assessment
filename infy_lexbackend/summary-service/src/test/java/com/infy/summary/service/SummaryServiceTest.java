package com.infy.summary.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.summary.client.BatchInfo;
import com.infy.summary.client.RegistrationInfo;
import com.infy.summary.client.RegistrationServiceClient;
import com.infy.summary.client.UserServiceClient;
import com.infy.summary.exception.BusinessException;
import com.infy.summary.repository.RegistrationSummaryViewRepository;

/**
 * Summary aggregation and owner-scoped authorization (FR-012, VR-010).
 * Self-defined test case IDs — test.md is empty.
 */
@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock
    private UserServiceClient userServiceClient;
    @Mock
    private RegistrationServiceClient registrationServiceClient;
    @Mock
    private RegistrationSummaryViewRepository summaryViewRepository;

    @InjectMocks
    private SummaryService summaryService;

    private final UUID batchId = UUID.randomUUID();
    private final UUID ownerUserId = UUID.randomUUID();

    private void stubStudentsAndRegistrations() {
        UUID student1 = UUID.randomUUID();
        UUID student2 = UUID.randomUUID();
        when(userServiceClient.getStudentIdsByBatch(batchId))
                .thenReturn(List.of(student1, student2));
        when(registrationServiceClient.getRegistrationsByStudentIds(List.of(student1, student2)))
                .thenReturn(List.of(
                        RegistrationInfo.builder().studentId(student1).status("REGISTERED").build(),
                        RegistrationInfo.builder().studentId(student2).status("CANCELLED").build()));
        when(summaryViewRepository.findById(org.mockito.ArgumentMatchers.anyString())).thenReturn(Optional.empty());
        when(summaryViewRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void tcSummary001_getBatchSummary_administrator_countsRegisteredAndCancelled() {
        stubStudentsAndRegistrations();

        var response = summaryService.getBatchSummary(batchId, "ADMINISTRATOR", UUID.randomUUID());

        assertThat(response.getTotalRegistered()).isEqualTo(1);
        assertThat(response.getTotalCancelled()).isEqualTo(1);
    }

    @Test
    void tcSummary002_getBatchSummary_ownerInstructor_isAuthorized() {
        stubStudentsAndRegistrations();
        when(userServiceClient.getBatch(batchId))
                .thenReturn(Optional.of(BatchInfo.builder().batchId(batchId).ownerId(ownerUserId).build()));

        var response = summaryService.getBatchSummary(batchId, "INSTRUCTOR", ownerUserId);

        assertThat(response.getTotalRegistered()).isEqualTo(1);
    }

    @Test
    void tcSummary003_getBatchSummary_nonOwnerInstructor_throwsAccessDenied() {
        UUID otherUserId = UUID.randomUUID();
        when(userServiceClient.getBatch(batchId))
                .thenReturn(Optional.of(BatchInfo.builder().batchId(batchId).ownerId(ownerUserId).build()));

        assertThatThrownBy(() -> summaryService.getBatchSummary(batchId, "INSTRUCTOR", otherUserId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("SUMMARY_ACCESS_DENIED"));
    }

    @Test
    void tcSummary004_getBatchSummary_studentRole_throwsAccessDenied() {
        assertThatThrownBy(() -> summaryService.getBatchSummary(batchId, "STUDENT", UUID.randomUUID()))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("SUMMARY_ACCESS_DENIED"));
    }

    @Test
    void tcSummary005_getAssessmentWiseSummary_groupsByAssessment() {
        UUID student1 = UUID.randomUUID();
        UUID assessmentA = UUID.randomUUID();
        UUID assessmentB = UUID.randomUUID();
        when(userServiceClient.getStudentIdsByBatch(batchId)).thenReturn(List.of(student1));
        when(registrationServiceClient.getRegistrationsByStudentIds(List.of(student1))).thenReturn(List.of(
                RegistrationInfo.builder().studentId(student1).assessmentId(assessmentA).status("REGISTERED").build(),
                RegistrationInfo.builder().studentId(student1).assessmentId(assessmentB).status("CANCELLED").build()));
        when(summaryViewRepository.findById(org.mockito.ArgumentMatchers.anyString())).thenReturn(Optional.empty());
        when(summaryViewRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(inv -> inv.getArgument(0));

        var response = summaryService.getAssessmentWiseSummary(batchId, "ADMINISTRATOR", UUID.randomUUID());

        assertThat(response.getAssessments()).hasSize(2);
    }
}
