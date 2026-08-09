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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quiz_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "question_id", updatable = false, nullable = false, length = 36)
    private UUID questionId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "quiz_id", nullable = false, length = 36)
    private UUID quizId;

    @Column(name = "question_text", nullable = false, length = 2000)
    private String questionText;

    @Column(name = "question_type", nullable = false, length = 20)
    private String questionType;

    @Column(name = "difficulty_level", length = 20)
    private String difficultyLevel;

    @Column(name = "marks", nullable = false)
    private Integer marks;

    @Column(name = "option_set", nullable = false, length = 1000)
    private String optionSet;

    @Column(name = "correct_answer_key", nullable = false, length = 100)
    private String correctAnswerKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
