package com.infy.learning.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.infy.learning.dto.QuizQuestionCreateRequest;
import com.infy.learning.dto.QuizQuestionResponse;
import com.infy.learning.entity.Quiz;
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
        return quizQuestionRepository.findByQuizId(quizId).stream()
                .map(QuizQuestionMapper::toResponse)
                .toList();
    }

    public QuizQuestionResponse addQuestion(UUID quizId, QuizQuestionCreateRequest request, String role,
            UUID requesterUserId) {
        Quiz quiz = quizService.findQuizOrThrow(quizId);
        var course = courseService.findCourseOrThrow(quiz.getCourseId());
        authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());
        return QuizQuestionMapper.toResponse(
                quizQuestionRepository.save(QuizQuestionMapper.toEntity(quizId, request)));
    }
}
