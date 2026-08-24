package com.passportsahayak.kb.repository;

import com.passportsahayak.kb.entity.EmbeddingStatus;
import com.passportsahayak.kb.entity.KbChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface KbChunkRepository extends JpaRepository<KbChunk, Long> {
    List<KbChunk> findByDocumentDocumentIdOrderByChunkIndexAsc(String documentId);

    @Query("SELECT c FROM KbChunk c JOIN FETCH c.document d WHERE c.embeddingStatus = :status AND d.status = com.passportsahayak.kb.entity.KbDocumentStatus.ACTIVE")
    List<KbChunk> findEmbeddedActiveChunks(EmbeddingStatus status);

    List<KbChunk> findByEmbeddingStatus(EmbeddingStatus status);
}
