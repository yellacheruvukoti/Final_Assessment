package com.infy.learning.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.learning.enums.QuizStatus;

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
public class QuizResponse {
    private UUID quizId;
    private UUID courseId;
    private String title;
    private QuizStatus status;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private Integer totalMarks;
    private UUID ownerInstructorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
