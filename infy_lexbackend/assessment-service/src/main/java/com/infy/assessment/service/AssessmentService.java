package com.infy.assessment.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.assessment.client.BatchServiceClient;
import com.infy.assessment.client.CourseServiceClient;
import com.infy.assessment.dto.AssessmentCreateRequest;
import com.infy.assessment.dto.AssessmentResponse;
import com.infy.assessment.dto.AssessmentUpdateRequest;
import com.infy.assessment.entity.Assessment;
import com.infy.assessment.enums.AssessmentStatus;
import com.infy.assessment.enums.ScopeType;
import com.infy.assessment.exception.BusinessException;
import com.infy.assessment.mapper.AssessmentMapper;
import com.infy.assessment.repository.AssessmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final CourseServiceClient courseServiceClient;
    private final BatchServiceClient batchServiceClient;

    public List<AssessmentResponse> listAssessments(AssessmentStatus statusFilter) {
        List<Assessment> assessments = statusFilter == null
                ? assessmentRepository.findAll()
                : assessmentRepository.findByStatus(statusFilter);
        return assessments.stream().map(AssessmentMapper::toResponse).toList();
    }

    /**
     * Upcoming per AS-004 / clarification.md Section 2: status PUBLISHED and
     * current timestamp before startTime.
     */
    public List<AssessmentResponse> listUpcoming() {
        return assessmentRepository.findByStatusAndStartTimeAfter(AssessmentStatus.PUBLISHED, LocalDateTime.now())
                .stream()
                .map(AssessmentMapper::toResponse)
                .toList();
    }

    public AssessmentResponse getAssessment(UUID assessmentId) {
        return AssessmentMapper.toResponse(findAssessmentOrThrow(assessmentId));
    }

    public AssessmentResponse createAssessment(AssessmentCreateRequest request) {
        if (assessmentRepository.findByAssessmentCode(request.getAssessmentCode()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "VALIDATION_ERROR",
                    "Assessment code " + request.getAssessmentCode() + " already exists.");
        }
        requireValidScope(request.getScopeType(), request.getScopeId());
        Assessment saved = assessmentRepository.save(AssessmentMapper.toEntity(request));
        return AssessmentMapper.toResponse(saved);
    }

    private void requireValidScope(ScopeType scopeType, UUID scopeId) {
        if (scopeType == ScopeType.COURSE && !courseServiceClient.courseExists(scopeId)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "COURSE_NOT_FOUND",
                    "Course not found for id " + scopeId);
        }
        if (scopeType == ScopeType.BATCH && !batchServiceClient.batchExists(scopeId)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "BATCH_NOT_FOUND",
                    "Batch not found for id " + scopeId);
        }
    }

    public AssessmentResponse updateAssessment(UUID assessmentId, AssessmentUpdateRequest request) {
        Assessment assessment = findAssessmentOrThrow(assessmentId);
        AssessmentMapper.applyUpdate(assessment, request);
        return AssessmentMapper.toResponse(assessmentRepository.save(assessment));
    }

    private Assessment findAssessmentOrThrow(UUID assessmentId) {
        return assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ASSESSMENT_NOT_FOUND",
                        "Assessment not found for id " + assessmentId));
    }
}
