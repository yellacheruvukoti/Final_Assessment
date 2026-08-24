package com.passportsahayak.kb.dto;

/** Shape mandated by the SRS Section 4.1.5 KB Ingestion Response contract. */
public record IngestDocumentResponse(
        String documentId,
        int chunks_created,
        long ingestion_time_ms,
        IngestMetadata metadata
) {
}
