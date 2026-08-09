package com.infy.summary.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.summary.client.BatchInfo;
import com.infy.summary.client.RegistrationInfo;
import com.infy.summary.client.RegistrationServiceClient;
import com.infy.summary.client.UserServiceClient;
import com.infy.summary.dto.AssessmentSummaryItem;
import com.infy.summary.dto.AssessmentWiseSummaryResponse;
import com.infy.summary.dto.RegistrationSummaryResponse;
import com.infy.summary.entity.RegistrationSummaryView;
import com.infy.summary.exception.BusinessException;
import com.infy.summary.repository.RegistrationSummaryViewRepository;

import lombok.RequiredArgsConstructor;

/**
 * Batch-wise registration summaries derived from registration-service data
 * (FR-012), with owner-level authorization (VR-010): Administrator may view
 * any batch; Instructor may view only batches they own.
 */
@Service
@RequiredArgsConstructor
public class SummaryService {

    private static final String ROLE_ADMINISTRATOR = "ADMINISTRATOR";
    private static final String ROLE_INSTRUCTOR = "INSTRUCTOR";
    private static final String STATUS_REGISTERED = "REGISTERED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private final UserServiceClient userServiceClient;
    private final RegistrationServiceClient registrationServiceClient;
    private final RegistrationSummaryViewRepository summaryViewRepository;

    public RegistrationSummaryResponse getBatchSummary(UUID batchId, String role, UUID requesterUserId) {
        authorize(role, requesterUserId, batchId);
        List<RegistrationInfo> registrations = fetchBatchRegistrations(batchId);
        LocalDateTime now = LocalDateTime.now();
        int registered = countByStatus(registrations, STATUS_REGISTERED);
        int cancelled = countByStatus(registrations, STATUS_CANCELLED);
        cacheSummary(batchId, null, registered, cancelled, now);
        return RegistrationSummaryResponse.builder()
                .batchId(batchId)
                .totalRegistered(registered)
                .totalCancelled(cancelled)
                .generatedAt(now)
                .build();
    }

    public RegistrationSummaryResponse getStatusWiseSummary(UUID batchId, String role, UUID requesterUserId) {
        return getBatchSummary(batchId, role, requesterUserId);
    }

    public AssessmentWiseSummaryResponse getAssessmentWiseSummary(UUID batchId, String role, UUID requesterUserId) {
        authorize(role, requesterUserId, batchId);
        List<RegistrationInfo> registrations = fetchBatchRegistrations(batchId);
        LocalDateTime now = LocalDateTime.now();

        Map<UUID, List<RegistrationInfo>> byAssessment = registrations.stream()
                .collect(Collectors.groupingBy(RegistrationInfo::getAssessmentId));

        List<AssessmentSummaryItem> items = byAssessment.entrySet().stream()
                .map(entry -> {
                    int registered = countByStatus(entry.getValue(), STATUS_REGISTERED);
                    int cancelled = countByStatus(entry.getValue(), STATUS_CANCELLED);
                    cacheSummary(batchId, entry.getKey(), registered, cancelled, now);
                    return AssessmentSummaryItem.builder()
                            .assessmentId(entry.getKey())
                            .totalRegistered(registered)
                            .totalCancelled(cancelled)
                            .build();
                })
                .toList();

        return AssessmentWiseSummaryResponse.builder()
                .batchId(batchId)
                .generatedAt(now)
                .assessments(items)
                .build();
    }

    private List<RegistrationInfo> fetchBatchRegistrations(UUID batchId) {
        List<UUID> studentIds = userServiceClient.getStudentIdsByBatch(batchId);
        return registrationServiceClient.getRegistrationsByStudentIds(studentIds);
    }

    private int countByStatus(List<RegistrationInfo> registrations, String status) {
        return (int) registrations.stream().filter(r -> status.equals(r.getStatus())).count();
    }

    /**
     * Batch.ownerId stores the owning instructor's USER id (confirmed against
     * the platform seed data — batches.owner_id matches users.user_id, not
     * instructors.instructor_id), so ownership is a direct comparison against
     * X-User-Id with no instructor-profile resolution needed.
     */
    private void authorize(String role, UUID requesterUserId, UUID batchId) {
        if (role != null && role.equalsIgnoreCase(ROLE_ADMINISTRATOR)) {
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_INSTRUCTOR) && requesterUserId != null) {
            BatchInfo batch = userServiceClient.getBatch(batchId).orElse(null);
            if (batch != null && requesterUserId.equals(batch.getOwnerId())) {
                return;
            }
        }
        throw new BusinessException(HttpStatus.FORBIDDEN, "SUMMARY_ACCESS_DENIED",
                "You are not authorized to view summaries for this batch.");
    }

    private void cacheSummary(UUID batchId, UUID assessmentId, int registered, int cancelled, LocalDateTime now) {
        String summaryId = batchId + (assessmentId == null ? "_ALL" : "_" + assessmentId);
        RegistrationSummaryView view = summaryViewRepository.findById(summaryId)
                .orElseGet(() -> RegistrationSummaryView.builder()
                        .summaryId(summaryId)
                        .batchId(batchId)
                        .assessmentId(assessmentId)
                        .build());
        view.setTotalRegistered(registered);
        view.setTotalCancelled(cancelled);
        view.setGeneratedAt(now);
        summaryViewRepository.save(view);
    }
}
