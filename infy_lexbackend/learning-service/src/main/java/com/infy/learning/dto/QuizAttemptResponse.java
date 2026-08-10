package com.infy.learning.dto;

import java.time.LocalDateTime;
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
public class QuizAttemptResponse {
    private UUID attemptId;
    private UUID quizId;
    private UUID studentId;
    private UUID assessmentId;
    private Integer totalQuestions;
    private Integer correctCount;
    private Double scorePercentage;
    private LocalDateTime submittedAt;
}
