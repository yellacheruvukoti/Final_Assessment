package com.infy.learning.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.infy.learning.enums.ProgressStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * No createdAt field per data-model.md 3.13 and the platform SQL scripts —
 * this entity only tracks updatedAt.
 */
@Entity
@Table(name = "learner_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_course_module_progress",
                columnNames = { "student_id", "course_id", "module_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearnerProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "progress_id", updatable = false, nullable = false, length = 36)
    private UUID progressId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "student_id", nullable = false, length = 36)
    private UUID studentId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "course_id", nullable = false, length = 36)
    private UUID courseId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "module_id", length = 36)
    private UUID moduleId;

    @Column(name = "completion_percentage", nullable = false)
    private Double completionPercentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_status", nullable = false, length = 20)
    private ProgressStatus progressStatus;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}
