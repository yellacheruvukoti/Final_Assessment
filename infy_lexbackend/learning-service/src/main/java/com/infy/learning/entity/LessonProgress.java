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

/**
 * Per-lesson (LearningMaterial) completion record for a student. Feeds the
 * module-level and course-level LearnerProgress rollup rows — see
 * LearnerProgressService.markLessonComplete.
 */
@Entity
@Table(name = "lesson_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_material_progress", columnNames = { "student_id", "material_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "lesson_progress_id", updatable = false, nullable = false, length = 36)
    private UUID lessonProgressId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "student_id", nullable = false, length = 36)
    private UUID studentId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "course_id", nullable = false, length = 36)
    private UUID courseId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "module_id", nullable = false, length = 36)
    private UUID moduleId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "material_id", nullable = false, length = 36)
    private UUID materialId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        this.completedAt = LocalDateTime.now();
    }
}
