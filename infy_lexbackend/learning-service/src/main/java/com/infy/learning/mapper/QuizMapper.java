package com.infy.learning.mapper;

import com.infy.learning.dto.QuizCreateRequest;
import com.infy.learning.dto.QuizResponse;
import com.infy.learning.dto.QuizUpdateRequest;
import com.infy.learning.entity.Quiz;

public final class QuizMapper {

    private QuizMapper() {
    }

    public static QuizResponse toResponse(Quiz quiz) {
        return QuizResponse.builder()
                .quizId(quiz.getQuizId())
                .courseId(quiz.getCourseId())
                .assessmentId(quiz.getAssessmentId())
                .title(quiz.getTitle())
                .status(quiz.getStatus())
                .scheduledAt(quiz.getScheduledAt())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .ownerInstructorId(quiz.getOwnerInstructorId())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }

    public static Quiz toEntity(QuizCreateRequest request) {
        return Quiz.builder()
                .courseId(request.getCourseId())
                .assessmentId(request.getAssessmentId())
                .title(request.getTitle())
                .scheduledAt(request.getScheduledAt())
                .durationMinutes(request.getDurationMinutes())
                .totalMarks(request.getTotalMarks())
                .ownerInstructorId(request.getOwnerInstructorId())
                .build();
    }

    public static void applyUpdate(Quiz quiz, QuizUpdateRequest request) {
        quiz.setTitle(request.getTitle());
        quiz.setStatus(request.getStatus());
        quiz.setScheduledAt(request.getScheduledAt());
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setTotalMarks(request.getTotalMarks());
    }
}
