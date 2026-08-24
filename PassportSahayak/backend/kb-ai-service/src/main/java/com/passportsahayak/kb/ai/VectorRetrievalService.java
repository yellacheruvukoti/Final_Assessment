package com.passportsahayak.kb.ai;

import com.passportsahayak.kb.entity.EmbeddingStatus;
import com.passportsahayak.kb.entity.KbChunk;
import com.passportsahayak.kb.repository.KbChunkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Vector retrieval step of the RAG pipeline (SRS Sec 2.1 / 4.1.1). Brute-force cosine
 * similarity over all EMBEDDED chunks of ACTIVE documents - fine at this KB's scale.
 * allowEmptyContext=false is enforced by the caller: chunks below the similarity
 * threshold are simply never returned, so no low-confidence context ever reaches the LLM.
 */
@Service
@RequiredArgsConstructor
public class VectorRetrievalService {

    private final KbChunkRepository chunkRepository;
    private final EmbeddingService embeddingService;

    @Value("${app.kb.similarity-threshold}")
    private double similarityThreshold;

    @Value("${app.ai.top-k:5}")
    private int topK;

    @Transactional(readOnly = true)
    public List<RetrievedChunk> retrieve(String transformedQuery) {
        List<KbChunk> candidates = chunkRepository.findEmbeddedActiveChunks(EmbeddingStatus.EMBEDDED);
        if (candidates.isEmpty()) {
            return List.of();
        }

        float[] queryVector = embeddingService.embed(transformedQuery);

        return candidates.stream()
                .map(chunk -> {
                    float[] chunkVector = embeddingService.fromJson(chunk.getEmbedding());
                    double similarity = embeddingService.cosineSimilarity(queryVector, chunkVector);
                    return new RetrievedChunk(chunk.getId(), chunk.getChunkIndex(), chunk.getContent(),
                            chunk.getDocument().getDocCode(), chunk.getDocument().getTitle(), similarity);
                })
                .filter(rc -> rc.similarity() >= similarityThreshold)
                .sorted(Comparator.comparingDouble(RetrievedChunk::similarity).reversed())
                .limit(topK)
                .toList();
    }
}
