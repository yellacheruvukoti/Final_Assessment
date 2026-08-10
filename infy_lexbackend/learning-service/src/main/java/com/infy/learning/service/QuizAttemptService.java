package com.infy.learning.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.client.AssessmentInfo;
import com.infy.learning.client.AssessmentServiceClient;
import com.infy.learning.client.StudentInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.dto.QuizAnswerRequest;
import com.infy.learning.dto.QuizAttemptResponse;
import com.infy.learning.dto.QuizSubmissionRequest;
import com.infy.learning.entity.Quiz;
import com.infy.learning.entity.QuizAnswer;
import com.infy.learning.entity.QuizAttempt;
import com.infy.learning.entity.QuizQuestion;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.repository.CourseEnrollmentRepository;
import com.infy.learning.repository.QuizAnswerRepository;
import com.infy.learning.repository.QuizAttemptRepository;
import com.infy.learning.repository.QuizQuestionRepository;

import lombok.RequiredArgsConstructor;

/**
 * Student quiz submission (new capability — no attempt/score concept existed
 * previously anywhere in the backend). Scoring is always computed
 * server-side against QuizQuestion.correctAnswerKey; the client only ever
 * supplies selected option keys, never a score.
 */
@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private static final String ENROLLMENT_ACTIVE = "ACTIVE";

    private final QuizService quizService;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final UserServiceClient userServiceClient;
    private final AssessmentServiceClient assessmentServiceClient;
    private final AssessmentCompletionService assessmentCompletionService;

    public QuizAttemptResponse submitAttempt(UUID quizId, QuizSubmissionRequest request, String role,
            UUID requesterUserId) {
        Quiz quiz = quizService.findQuizOrThrow(quizId);
        StudentInfo student = resolveStudent(role, requesterUserId);
        UUID studentId = student.getStudentId();
        requireQuizAccess(quiz, student);

        if (quizAttemptRepository.findByStudentIdAndQuizId(studentId, quizId).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "QUIZ_ALREADY_ATTEMPTED",
                    "This quiz has already been attempted.");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);
        if (questions.isEmpty()) {
            throw new BusinessException(HttpStatus.CONFLICT, "QUIZ_HAS_NO_QUESTIONS",
                    "This quiz has no questions to attempt.");
        }
        Map<UUID, String> selectedByQuestion = request.getAnswers().stream()
                .collect(Collectors.toMap(QuizAnswerRequest::getQuestionId,
                        QuizAnswerRequest::getSelectedKey, (a, b) -> b));

        int correctCount = 0;
        QuizAttempt attempt = QuizAttempt.builder()
                .quizId(quizId)
                .studentId(studentId)
                .assessmentId(quiz.getAssessmentId())
                .totalQuestions(questions.size())
                .correctCount(0)
                .scorePercentage(0.0)
                .build();
        attempt = quizAttemptRepository.save(attempt);

        for (QuizQuestion question : questions) {
            String selected = selectedByQuestion.get(question.getQuestionId());
            boolean correct = selected != null
                    && selected.trim().equalsIgnoreCase(question.getCorrectAnswerKey().trim());
            if (correct) {
                correctCount++;
            }
            quizAnswerRepository.save(QuizAnswer.builder()
                    .attemptId(attempt.getAttemptId())
                    .questionId(question.getQuestionId())
                    .selectedKey(selected)
                    .correct(correct)
                    .build());
        }

        double scorePercentage = (correctCount * 100.0) / questions.size();
        attempt.setCorrectCount(correctCount);
        attempt.setScorePercentage(Math.round(scorePercentage * 100.0) / 100.0);
        attempt = quizAttemptRepository.save(attempt);

        if (quiz.getAssessmentId() != null) {
            assessmentCompletionService.evaluateAndIssueCertificateIfEligible(quiz.getAssessmentId(), studentId);
        }

        return toResponse(attempt);
    }

    public QuizAttemptResponse getMyAttempt(UUID quizId, String role, UUID requesterUserId) {
        UUID studentId = resolveStudent(role, requesterUserId).getStudentId();
        return quizAttemptRepository.findByStudentIdAndQuizId(studentId, quizId)
                .map(this::toResponse)
                .orElse(null);
    }

    private StudentInfo resolveStudent(String role, UUID requesterUserId) {
        if (role == null || !role.equalsIgnoreCase("STUDENT") || requesterUserId == null) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                    "Only students may attempt quizzes.");
        }
        StudentInfo student = userServiceClient.getStudentByUserId(requesterUserId).orElse(null);
        if (student == null) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                    "Unable to resolve the requesting student.");
        }
        return student;
    }

    /**
     * Course-scoped quizzes (quiz.courseId set): existing enrollment check,
     * unchanged. Assessment-linked quizzes (quiz.assessmentId set, no
     * courseId): resolve the assessment's scope and require course
     * enrollment (COURSE) or batch membership (BATCH) — requirements 22/23.
     */
    private void requireQuizAccess(Quiz quiz, StudentInfo student) {
        if (quiz.getCourseId() != null) {
            requireCourseEnrollment(student.getStudentId(), quiz.getCourseId());
            return;
        }
        if (quiz.getAssessmentId() == null) {
            return;
        }
        AssessmentInfo assessment = assessmentServiceClient.getAssessment(quiz.getAssessmentId()).orElse(null);
        if (assessment == null || assessment.getScopeType() == null) {
            return;
        }
        if ("COURSE".equals(assessment.getScopeType())) {
            requireCourseEnrollment(student.getStudentId(), assessment.getScopeId());
        } else if ("BATCH".equals(assessment.getScopeType())) {
            if (student.getBatchId() == null || !student.getBatchId().equals(assessment.getScopeId())) {
                throw new BusinessException(HttpStatus.FORBIDDEN, "BATCH_ACCESS_DENIED",
                        "Student does not belong to the batch this assessment belongs to.");
            }
        }
    }

    private void requireCourseEnrollment(UUID studentId, UUID courseId) {
        boolean enrolled = courseEnrollmentRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .filter(e -> ENROLLMENT_ACTIVE.equals(e.getEnrollmentStatus()))
                .isPresent();
        if (!enrolled) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_NOT_ENROLLED",
                    "Student is not enrolled in this course.");
        }
    }

    private QuizAttemptResponse toResponse(QuizAttempt attempt) {
        return QuizAttemptResponse.builder()
                .attemptId(attempt.getAttemptId())
                .quizId(attempt.getQuizId())
                .studentId(attempt.getStudentId())
                .assessmentId(attempt.getAssessmentId())
                .totalQuestions(attempt.getTotalQuestions())
                .correctCount(attempt.getCorrectCount())
                .scorePercentage(attempt.getScorePercentage())
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }
}
