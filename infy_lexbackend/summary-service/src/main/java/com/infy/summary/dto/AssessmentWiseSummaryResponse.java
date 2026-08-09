package com.infy.summary.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentWiseSummaryResponse {
    private UUID batchId;
    private LocalDateTime generatedAt;
    private List<AssessmentSummaryItem> assessments;
}
