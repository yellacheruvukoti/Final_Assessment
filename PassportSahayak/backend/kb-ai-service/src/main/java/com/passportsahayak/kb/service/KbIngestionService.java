package com.passportsahayak.kb.service;

import com.passportsahayak.kb.ai.EmbeddingService;
import com.passportsahayak.kb.dto.IngestDocumentResponse;
import com.passportsahayak.kb.dto.IngestMetadata;
import com.passportsahayak.kb.entity.EmbeddingStatus;
import com.passportsahayak.kb.entity.KbChunk;
import com.passportsahayak.kb.entity.KbDocument;
import com.passportsahayak.kb.entity.KbDocumentStatus;
import com.passportsahayak.kb.exception.ApiException;
import com.passportsahayak.kb.repository.KbChunkRepository;
import com.passportsahayak.kb.repository.KbDocumentRepository;
import com.passportsahayak.kb.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KbIngestionService {

    private final KbDocumentRepository documentRepository;
    private final KbChunkRepository chunkRepository;
    private final ChunkingService chunkingService;
    private final EmbeddingService embeddingService;

    @Value("${app.kb.chunk-max-chars}")
    private int chunkMaxChars;

    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;

    /**
     * {@code content} is the already text-extracted body of the document (per KB-PASS-007
     * Sec 4.1 step 3, documents must be "clean, text-extractable" before ingestion). The
     * original {@code file} is retained only for filename/size/content-type metadata.
     */
    @Transactional
    public IngestDocumentResponse ingest(AuthenticatedUser principal, MultipartFile file, String content,
                                          String docCode, String title, String version, String audience,
                                          LocalDate effectiveDate, String tags) {
        long start = System.currentTimeMillis();

        if (content == null || content.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "content (extracted text) must not be empty");
        }

        List<String> chunks = chunkingService.chunk(content, chunkMaxChars);
        if (chunks.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No chunks could be produced from the supplied content");
        }

        String documentId = UUID.randomUUID().toString();
        long ingestionTimeMs = System.currentTimeMillis() - start;

        KbDocument document = KbDocument.builder()
                .documentId(documentId)
                .docCode(docCode)
                .title(title)
                .version(version)
                .audience(audience)
                .effectiveDate(effectiveDate)
                .tags(tags)
                .originalFilename(file != null ? file.getOriginalFilename() : title)
                .contentType(file != null ? file.getContentType() : "text/plain")
                .fileSizeBytes(file != null ? file.getSize() : content.length())
                .status(KbDocumentStatus.ACTIVE)
                .chunkCount(chunks.size())
                .ingestionTimeMs(ingestionTimeMs)
                .uploadedByRole(principal.role())
                .uploadedByUserId(principal.userId())
                .createdAt(Instant.now())
                .build();
        documentRepository.save(document);

        for (int i = 0; i < chunks.size(); i++) {
            KbChunk chunk = KbChunk.builder()
                    .document(document)
                    .chunkIndex(i)
                    .content(chunks.get(i))
                    .build();
            embedBestEffort(chunk);
            chunkRepository.save(chunk);
        }

        IngestMetadata metadata = new IngestMetadata(docCode, version, audience, effectiveDate, tags);
        return new IngestDocumentResponse(documentId, chunks.size(), ingestionTimeMs, metadata);
    }

    /**
     * Re-attempts embedding for every chunk still PENDING (e.g. ingested before real Azure
     * OpenAI credentials were configured). Safe to call repeatedly.
     */
    @Transactional
    public int backfillPendingEmbeddings() {
        List<KbChunk> pending = chunkRepository.findByEmbeddingStatus(EmbeddingStatus.PENDING);
        int embedded = 0;
        for (KbChunk chunk : pending) {
            embedBestEffort(chunk);
            if (chunk.getEmbeddingStatus() == EmbeddingStatus.EMBEDDED) {
                embedded++;
            }
            chunkRepository.save(chunk);
        }
        return embedded;
    }

    /**
     * Embeds a chunk if the AI layer is enabled. Never throws: if Azure OpenAI credentials
     * are still placeholders (or the call otherwise fails), the chunk is simply left/marked
     * PENDING/FAILED so ingestion always succeeds - embeddings can be backfilled later via
     * POST /kb/embeddings/backfill once real credentials are supplied.
     */
    private void embedBestEffort(KbChunk chunk) {
        if (!aiEnabled) {
            return;
        }
        try {
            float[] vector = embeddingService.embed(chunk.getContent());
            chunk.setEmbedding(embeddingService.toJson(vector));
            chunk.setEmbeddingStatus(EmbeddingStatus.EMBEDDED);
        } catch (Exception e) {
            log.warn("Embedding failed for a chunk of document {} (will remain PENDING for backfill): {}",
                    chunk.getDocument() != null ? chunk.getDocument().getDocumentId() : "?", e.getMessage());
            chunk.setEmbeddingStatus(EmbeddingStatus.PENDING);
        }
    }
}
