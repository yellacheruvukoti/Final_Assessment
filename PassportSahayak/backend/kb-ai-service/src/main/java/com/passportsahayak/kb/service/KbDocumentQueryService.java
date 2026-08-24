package com.passportsahayak.kb.service;

import com.passportsahayak.kb.dto.KbChunkResponse;
import com.passportsahayak.kb.dto.KbDocumentResponse;
import com.passportsahayak.kb.entity.KbDocument;
import com.passportsahayak.kb.entity.KbDocumentStatus;
import com.passportsahayak.kb.exception.ApiException;
import com.passportsahayak.kb.repository.KbChunkRepository;
import com.passportsahayak.kb.repository.KbDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KbDocumentQueryService {

    private final KbDocumentRepository documentRepository;
    private final KbChunkRepository chunkRepository;

    public Page<KbDocumentResponse> list(Pageable pageable) {
        return documentRepository.findAllByOrderByCreatedAtDesc(pageable).map(KbDocumentResponse::from);
    }

    public KbDocumentResponse getById(String documentId) {
        return KbDocumentResponse.from(findOrThrow(documentId));
    }

    public List<KbChunkResponse> getChunks(String documentId) {
        findOrThrow(documentId);
        return chunkRepository.findByDocumentDocumentIdOrderByChunkIndexAsc(documentId)
                .stream().map(KbChunkResponse::from).toList();
    }

    @Transactional
    public KbDocumentResponse supersede(String documentId) {
        KbDocument document = findOrThrow(documentId);
        document.setStatus(KbDocumentStatus.SUPERSEDED);
        return KbDocumentResponse.from(documentRepository.save(document));
    }

    private KbDocument findOrThrow(String documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No KB document found with id " + documentId));
    }
}
