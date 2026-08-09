package com.infy.learning.mapper;

import java.util.UUID;

import com.infy.learning.dto.QuizQuestionCreateRequest;
import com.infy.learning.dto.QuizQuestionResponse;
import com.infy.learning.entity.QuizQuestion;

public final class QuizQuestionMapper {

    private QuizQuestionMapper() {
    }

    public static QuizQuestionResponse toResponse(QuizQuestion question) {
        return QuizQuestionResponse.builder()
                .questionId(question.getQuestionId())
                .quizId(question.getQuizId())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .difficultyLevel(question.getDifficultyLevel())
                .marks(question.getMarks())
                .optionSet(question.getOptionSet())
                .correctAnswerKey(question.getCorrectAnswerKey())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    public static QuizQuestion toEntity(UUID quizId, QuizQuestionCreateRequest request) {
        return QuizQuestion.builder()
                .quizId(quizId)
                .questionText(request.getQuestionText())
                .questionType(request.getQuestionType())
                .difficultyLevel(request.getDifficultyLevel())
                .marks(request.getMarks())
                .optionSet(request.getOptionSet())
                .correctAnswerKey(request.getCorrectAnswerKey())
                .build();
    }
}
