package com.passportsahayak.kb.controller;

import com.passportsahayak.kb.dto.KbChunkResponse;
import com.passportsahayak.kb.dto.KbDocumentResponse;
import com.passportsahayak.kb.service.KbDocumentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kb/documents")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','PSK_OFFICIAL','RPO_OFFICIAL')")
public class KbDocumentController {

    private final KbDocumentQueryService kbDocumentQueryService;

    @GetMapping
    public ResponseEntity<Page<KbDocumentResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(kbDocumentQueryService.list(pageable));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<KbDocumentResponse> getById(@PathVariable String documentId) {
        return ResponseEntity.ok(kbDocumentQueryService.getById(documentId));
    }

    @GetMapping("/{documentId}/chunks")
    public ResponseEntity<List<KbChunkResponse>> getChunks(@PathVariable String documentId) {
        return ResponseEntity.ok(kbDocumentQueryService.getChunks(documentId));
    }

    @PatchMapping("/{documentId}/supersede")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KbDocumentResponse> supersede(@PathVariable String documentId) {
        return ResponseEntity.ok(kbDocumentQueryService.supersede(documentId));
    }
}
