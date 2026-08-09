package com.infy.summary.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Derived read model (data-model.md 3.7). summaryId is a deterministic
 * business-composed key (e.g. "{batchId}_ALL" or "{batchId}_{assessmentId}"),
 * not a generated UUID, so this entity has no @GeneratedValue primary key.
 */
@Entity
@Table(name = "registration_summary_views")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationSummaryView {

    @Id
    @Column(name = "summary_id", updatable = false, nullable = false, length = 100)
    private String summaryId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "batch_id", nullable = false, length = 36)
    private UUID batchId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "assessment_id", length = 36)
    private UUID assessmentId;

    @Column(name = "total_registered", nullable = false)
    private Integer totalRegistered;

    @Column(name = "total_cancelled", nullable = false)
    private Integer totalCancelled;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "window_start")
    private LocalDateTime windowStart;

    @Column(name = "window_end")
    private LocalDateTime windowEnd;

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
