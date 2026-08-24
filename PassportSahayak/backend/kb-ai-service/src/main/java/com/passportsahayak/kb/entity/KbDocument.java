package com.passportsahayak.kb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "kb_document")
public class KbDocument {

    @Id
    @Column(length = 36)
    private String documentId;

    @Column(length = 30)
    private String docCode;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(length = 60)
    private String audience;

    private LocalDate effectiveDate;

    @Column(length = 255)
    private String tags;

    @Column(nullable = false, length = 255)
    private String originalFilename;

    @Column(length = 100)
    private String contentType;

    private long fileSizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private KbDocumentStatus status;

    @Column(nullable = false)
    private int chunkCount;

    @Column(nullable = false)
    private long ingestionTimeMs;

    @Column(nullable = false, length = 15)
    private String uploadedByRole;

    private Long uploadedByUserId;

    @Column(nullable = false)
    private Instant createdAt;
}
