package com.infy.learning.entity;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quiz_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "answer_id", updatable = false, nullable = false, length = 36)
    private UUID answerId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "attempt_id", nullable = false, length = 36)
    private UUID attemptId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "question_id", nullable = false, length = 36)
    private UUID questionId;

    @Column(name = "selected_key", length = 100)
    private String selectedKey;

    @Column(name = "correct", nullable = false)
    private boolean correct;
}
