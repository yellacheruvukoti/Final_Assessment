package com.infy.summary.dto;

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
public class AssessmentSummaryItem {
    private UUID assessmentId;
    private Integer totalRegistered;
    private Integer totalCancelled;
}
