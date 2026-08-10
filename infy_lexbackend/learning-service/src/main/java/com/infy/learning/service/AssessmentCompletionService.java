package com.infy.learning.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.infy.learning.client.AssessmentInfo;
import com.infy.learning.client.AssessmentServiceClient;
import com.infy.learning.client.CertificateIssueRequest;
import com.infy.learning.client.CertificationServiceClient;
import com.infy.learning.client.RegistrationServiceClient;
import com.infy.learning.dto.AssessmentQuizProgressResponse;
import com.infy.learning.entity.Quiz;
import com.infy.learning.entity.QuizAttempt;
import com.infy.learning.enums.ProgressStatus;
import com.infy.learning.repository.LearnerProgressRepository;
import com.infy.learning.repository.QuizAttemptRepository;
import com.infy.learning.repository.QuizRepository;

import lombok.RequiredArgsConstructor;

/**
 * Certificate-eligibility formula (requirement 17): certificates are only
 * generated for COURSE-scoped assessments (BATCH-scoped assessments record
 * a result but never issue a certificate), and only when BOTH: (1) the
 * student's course-level progress is 100% (LearnerProgress, moduleId=null),
 * AND (2) ALL quizzes linked to the assessment have a submitted attempt with
 * an overall weighted score &gt;= 60%.
 */
@Service
@RequiredArgsConstructor
public class AssessmentCompletionService {

    private static final double PASSING_THRESHOLD = 60.0;

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final LearnerProgressRepository learnerProgressRepository;
    private final AssessmentServiceClient assessmentServiceClient;
    private final RegistrationServiceClient registrationServiceClient;
    private final CertificationServiceClient certificationServiceClient;

    public AssessmentQuizProgressResponse getProgress(UUID assessmentId, UUID studentId) {
        List<Quiz> quizzes = quizRepository.findByAssessmentId(assessmentId);
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdAndAssessmentId(studentId, assessmentId);

        int totalQuizzes = quizzes.size();
        int completedQuizzes = attempts.size();
        int totalQuestions = attempts.stream().mapToInt(QuizAttempt::getTotalQuestions).sum();
        int totalCorrect = attempts.stream().mapToInt(QuizAttempt::getCorrectCount).sum();
        double overallScore = totalQuestions == 0 ? 0.0 : (totalCorrect * 100.0) / totalQuestions;
        boolean allCompleted = totalQuizzes > 0 && completedQuizzes >= totalQuizzes;
        boolean eligible = allCompleted && overallScore >= PASSING_THRESHOLD;

        return AssessmentQuizProgressResponse.builder()
                .assessmentId(assessmentId)
                .studentId(studentId)
                .totalQuizzes(totalQuizzes)
                .completedQuizzes(completedQuizzes)
                .allQuizzesCompleted(allCompleted)
                .overallScorePercentage(Math.round(overallScore * 100.0) / 100.0)
                .certificateEligible(eligible)
                .build();
    }

    public void evaluateAndIssueCertificateIfEligible(UUID assessmentId, UUID studentId) {
        if (assessmentId == null) {
            return;
        }
        AssessmentQuizProgressResponse progress = getProgress(assessmentId, studentId);
        if (!progress.isCertificateEligible()) {
            return;
        }

        // Certificates only apply to COURSE-scoped assessments; a BATCH
        // assessment records a result but never issues one (requirement 17).
        AssessmentInfo assessment = assessmentServiceClient.getAssessment(assessmentId).orElse(null);
        if (assessment == null || !"COURSE".equals(assessment.getScopeType()) || assessment.getScopeId() == null) {
            return;
        }
        if (!isCourseComplete(studentId, assessment.getScopeId())) {
            return;
        }
        if (!registrationServiceClient.isActivelyRegistered(studentId, assessmentId)) {
            return;
        }
        certificationServiceClient.issueCertificate(CertificateIssueRequest.builder()
                .studentId(studentId)
                .assessmentId(assessmentId)
                .score(progress.getOverallScorePercentage())
                .build());
    }

    private boolean isCourseComplete(UUID studentId, UUID courseId) {
        return learnerProgressRepository.findByStudentIdAndCourseIdAndModuleId(studentId, courseId, null)
                .map(p -> p.getProgressStatus() == ProgressStatus.COMPLETED)
                .orElse(false);
    }
}
