package com.infy.learning.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import org.springframework.http.HttpStatus;

import com.infy.learning.dto.QuizQuestionCreateRequest;
import com.infy.learning.dto.QuizQuestionResponse;
import com.infy.learning.entity.Quiz;
import com.infy.learning.entity.QuizQuestion;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.mapper.QuizQuestionMapper;
import com.infy.learning.repository.QuizQuestionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuizQuestionService {

    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizService quizService;
    private final CourseService courseService;
    private final CourseAuthorizationService authorizationService;

    public List<QuizQuestionResponse> listByQuiz(UUID quizId) {
        return listByQuiz(quizId, null);
    }

    public List<QuizQuestionResponse> listByQuiz(UUID quizId, String role) {
        boolean stripAnswerKey = role != null && role.equalsIgnoreCase("STUDENT");
        return quizQuestionRepository.findByQuizId(quizId).stream()
                .map(QuizQuestionMapper::toResponse)
                .map(response -> {
                    if (stripAnswerKey) {
                        response.setCorrectAnswerKey(null);
                    }
                    return response;
                })
                .toList();
    }

    public QuizQuestionResponse addQuestion(UUID quizId, QuizQuestionCreateRequest request, String role,
            UUID requesterUserId) {
        Quiz quiz = quizService.findQuizOrThrow(quizId);
        requireQuizOwnership(quiz, role, requesterUserId);
        return QuizQuestionMapper.toResponse(
                quizQuestionRepository.save(QuizQuestionMapper.toEntity(quizId, request)));
    }

    public QuizQuestionResponse updateQuestion(UUID quizId, UUID questionId, QuizQuestionCreateRequest request,
            String role, UUID requesterUserId) {
        Quiz quiz = quizService.findQuizOrThrow(quizId);
        requireQuizOwnership(quiz, role, requesterUserId);
        QuizQuestion question = findQuestionOrThrow(quizId, questionId);
        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(request.getQuestionType());
        question.setDifficultyLevel(request.getDifficultyLevel());
        question.setMarks(request.getMarks());
        question.setOptionSet(request.getOptionSet());
        question.setCorrectAnswerKey(request.getCorrectAnswerKey());
        return QuizQuestionMapper.toResponse(quizQuestionRepository.save(question));
    }

    public void deleteQuestion(UUID quizId, UUID questionId, String role, UUID requesterUserId) {
        Quiz quiz = quizService.findQuizOrThrow(quizId);
        requireQuizOwnership(quiz, role, requesterUserId);
        QuizQuestion question = findQuestionOrThrow(quizId, questionId);
        quizQuestionRepository.delete(question);
    }

    private QuizQuestion findQuestionOrThrow(UUID quizId, UUID questionId) {
        QuizQuestion question = quizQuestionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND",
                        "Question not found for id " + questionId));
        if (!question.getQuizId().equals(quizId)) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND",
                    "Question " + questionId + " does not belong to quiz " + quizId);
        }
        return question;
    }

    private void requireQuizOwnership(Quiz quiz, String role, UUID requesterUserId) {
        if (quiz.getCourseId() != null) {
            var course = courseService.findCourseOrThrow(quiz.getCourseId());
            authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());
        } else {
            quizService.requireInstructorOrAdmin(role);
        }
    }
}
