package com.passportsahayak.application.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Owns the canonical lifecycle status of a passport application. appointment-service,
 * police-verification-service and fraud-service push status transitions here via the
 * internal API (see InternalApplicationController) as their part of the journey completes.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "passport_application")
@EntityListeners(AuditingEntityListener.class)
public class PassportApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String arn;

    @Column(nullable = false)
    private Long applicantUserId;

    @Column(nullable = false, length = 120)
    private String applicantFullName;

    @Column(nullable = false, length = 150)
    private String applicantEmail;

    @Column(nullable = false, length = 15)
    private String applicantPhone;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private boolean minor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationType applicationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ServiceScheme serviceScheme;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private BookletType bookletType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private ApplicationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private PvType pvType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TatkalReason tatkalReason;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal feeAmount;

    @Builder.Default
    @Column(nullable = false)
    private boolean feePaid = true;

    @Column(length = 500)
    private String remarks;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
