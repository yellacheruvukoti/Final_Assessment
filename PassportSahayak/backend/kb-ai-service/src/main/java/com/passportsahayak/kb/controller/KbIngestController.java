package com.passportsahayak.kb.controller;

import com.passportsahayak.kb.dto.IngestDocumentResponse;
import com.passportsahayak.kb.security.AuthenticatedUser;
import com.passportsahayak.kb.service.KbIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/kb")
@RequiredArgsConstructor
public class KbIngestController {

    private final KbIngestionService kbIngestionService;

    @PostMapping(value = "/ingest", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IngestDocumentResponse> ingest(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam String content,
            @RequestParam(required = false) String docCode,
            @RequestParam String title,
            @RequestParam(defaultValue = "v1.0") String version,
            @RequestParam(required = false) String audience,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveDate,
            @RequestParam(required = false) String tags) {
        IngestDocumentResponse response = kbIngestionService.ingest(principal, file, content, docCode, title,
                version, audience, effectiveDate, tags);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Re-attempts embedding for any chunk still PENDING - use this after supplying real
     * Azure OpenAI credentials to pick up documents that were ingested before the AI layer
     * was configured.
     */
    @PostMapping("/embeddings/backfill")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Integer>> backfillEmbeddings() {
        int embedded = kbIngestionService.backfillPendingEmbeddings();
        return ResponseEntity.ok(java.util.Map.of("chunksEmbedded", embedded));
    }
}
