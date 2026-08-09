package com.infy.assessment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.assessment.dto.AssessmentUpdateRequest;
import com.infy.assessment.entity.Assessment;
import com.infy.assessment.enums.AssessmentStatus;
import com.infy.assessment.exception.BusinessException;
import com.infy.assessment.repository.AssessmentRepository;

/**
 * TC-ASSESS-001: listUpcoming delegates to the PUBLISHED + startTime-after-now
 * repository query (AS-004, clarification.md Section 2).
 * TC-ASSESS-002: update on a missing assessment raises ASSESSMENT_NOT_FOUND.
 */
@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @InjectMocks
    private AssessmentService assessmentService;

    @Test
    void tcAssess001_listUpcoming_queriesPublishedAndFutureStartTime() {
        Assessment upcoming = Assessment.builder()
                .assessmentId(UUID.randomUUID())
                .status(AssessmentStatus.PUBLISHED)
                .startTime(LocalDateTime.now().plusDays(1))
                .build();
        when(assessmentRepository.findByStatusAndStartTimeAfter(eq(AssessmentStatus.PUBLISHED), any(LocalDateTime.class)))
                .thenReturn(List.of(upcoming));

        var result = assessmentService.listUpcoming();

        assertThat(result).hasSize(1);
        verify(assessmentRepository).findByStatusAndStartTimeAfter(eq(AssessmentStatus.PUBLISHED), any(LocalDateTime.class));
    }

    @Test
    void tcAssess002_updateAssessment_missingId_throwsAssessmentNotFound() {
        UUID assessmentId = UUID.randomUUID();
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> assessmentService.updateAssessment(assessmentId, new AssessmentUpdateRequest()))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("ASSESSMENT_NOT_FOUND"));
    }
}
