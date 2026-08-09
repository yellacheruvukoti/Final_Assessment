package com.infy.registration.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.infy.registration.enums.RegistrationStatus;

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
 * uk_student_assessment_active enforces one Registration row per
 * (studentId, assessmentId) for the entire history, not just active rows.
 * Cancellation and re-registration (FR-010/FR-011) therefore update this
 * same row's status/timestamps rather than inserting a new row per attempt.
 */
@Entity
@Table(name = "registrations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_assessment_active", columnNames = { "student_id", "assessment_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "registration_id", updatable = false, nullable = false, length = 36)
    private UUID registrationId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "student_id", nullable = false, length = 36)
    private UUID studentId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "assessment_id", nullable = false, length = 36)
    private UUID assessmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RegistrationStatus status;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "last_reactivated_at")
    private LocalDateTime lastReactivatedAt;

    @Column(name = "source_channel", length = 20)
    private String sourceChannel;

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
