package com.infy.summary.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Shared response shape for both the batch-level totals endpoint
 * (GET /summaries/batches/{batchId}) and the status-wise breakdown endpoint
 * (GET /summaries/batches/{batchId}/status) — both return the same
 * registered/cancelled totals per api-contract.md Section 11.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationSummaryResponse {
    private UUID batchId;
    private Integer totalRegistered;
    private Integer totalCancelled;
    private LocalDateTime generatedAt;
}
