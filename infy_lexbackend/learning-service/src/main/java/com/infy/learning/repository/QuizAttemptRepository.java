package com.infy.learning.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.learning.entity.QuizAttempt;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {

    Optional<QuizAttempt> findByStudentIdAndQuizId(UUID studentId, UUID quizId);

    List<QuizAttempt> findByStudentIdAndAssessmentId(UUID studentId, UUID assessmentId);
}
