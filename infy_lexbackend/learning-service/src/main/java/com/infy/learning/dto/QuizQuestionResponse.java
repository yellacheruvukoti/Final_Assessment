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
public class QuizQuestionResponse {
    private UUID questionId;
    private UUID quizId;
    private String questionText;
    private String questionType;
    private String difficultyLevel;
    private Integer marks;
    private String optionSet;
    private String correctAnswerKey;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
