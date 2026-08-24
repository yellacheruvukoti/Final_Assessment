package com.passportsahayak.kb.dto;

import com.passportsahayak.kb.entity.KbDocument;
import com.passportsahayak.kb.entity.KbDocumentStatus;

import java.time.Instant;
import java.time.LocalDate;

public record KbDocumentResponse(
        String documentId,
        String docCode,
        String title,
        String version,
        String audience,
        LocalDate effectiveDate,
        String tags,
        String originalFilename,
        KbDocumentStatus status,
        int chunkCount,
        long ingestionTimeMs,
        Instant createdAt
) {
    public static KbDocumentResponse from(KbDocument d) {
        return new KbDocumentResponse(d.getDocumentId(), d.getDocCode(), d.getTitle(), d.getVersion(),
                d.getAudience(), d.getEffectiveDate(), d.getTags(), d.getOriginalFilename(), d.getStatus(),
                d.getChunkCount(), d.getIngestionTimeMs(), d.getCreatedAt());
    }
}
