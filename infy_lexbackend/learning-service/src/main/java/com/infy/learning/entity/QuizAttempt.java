package com.infy.learning.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quiz_attempts", uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_quiz_attempt", columnNames = { "student_id", "quiz_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "attempt_id", updatable = false, nullable = false, length = 36)
    private UUID attemptId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "quiz_id", nullable = false, length = 36)
    private UUID quizId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "student_id", nullable = false, length = 36)
    private UUID studentId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "assessment_id", length = 36)
    private UUID assessmentId;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;

    @Column(name = "score_percentage", nullable = false)
    private Double scorePercentage;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
