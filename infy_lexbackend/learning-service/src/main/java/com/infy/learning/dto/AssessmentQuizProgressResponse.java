package com.infy.learning.dto;

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
public class AssessmentQuizProgressResponse {
    private UUID assessmentId;
    private UUID studentId;
    private int totalQuizzes;
    private int completedQuizzes;
    private boolean allQuizzesCompleted;
    private double overallScorePercentage;
    private boolean certificateEligible;
}
