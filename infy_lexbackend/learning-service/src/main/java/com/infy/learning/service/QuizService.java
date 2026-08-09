package com.infy.learning.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.dto.QuizCreateRequest;
import com.infy.learning.dto.QuizResponse;
import com.infy.learning.dto.QuizUpdateRequest;
import com.infy.learning.entity.Quiz;
import com.infy.learning.enums.QuizStatus;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.mapper.QuizMapper;
import com.infy.learning.repository.QuizRepository;

import lombok.RequiredArgsConstructor;

/**
 * Quiz lifecycle (FR-006, VR-006, BR-003): ownership is enforced against
 * Quiz.ownerInstructorId, which must match the owning Course's
 * instructorId per data-model.md's course ownership rules.
 */
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final CourseService courseService;
    private final CourseAuthorizationService authorizationService;

    public List<QuizResponse> listByCourse(UUID courseId) {
        return quizRepository.findByCourseId(courseId).stream().map(QuizMapper::toResponse).toList();
    }

    public QuizResponse getQuiz(UUID quizId) {
        return QuizMapper.toResponse(findQuizOrThrow(quizId));
    }

    public QuizResponse createQuiz(QuizCreateRequest request, String role, UUID requesterUserId) {
        var course = courseService.findCourseOrThrow(request.getCourseId());
        authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());
        if (!course.getInstructorId().equals(request.getOwnerInstructorId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                    "Quiz owner must match the course's owning instructor.");
        }
        Quiz quiz = QuizMapper.toEntity(request);
        quiz.setStatus(QuizStatus.DRAFT);
        return QuizMapper.toResponse(quizRepository.save(quiz));
    }

    public QuizResponse updateQuiz(UUID quizId, QuizUpdateRequest request, String role, UUID requesterUserId) {
        Quiz quiz = findQuizOrThrow(quizId);
        var course = courseService.findCourseOrThrow(quiz.getCourseId());
        authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());
        QuizMapper.applyUpdate(quiz, request);
        return QuizMapper.toResponse(quizRepository.save(quiz));
    }

    Quiz findQuizOrThrow(UUID quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUIZ_NOT_FOUND",
                        "Quiz not found for id " + quizId));
    }
}
