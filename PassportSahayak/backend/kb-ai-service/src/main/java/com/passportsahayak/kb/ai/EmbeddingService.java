package com.passportsahayak.kb.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

/**
 * Wraps the Azure OpenAI embedding model (text-embedding-3-small / ada). The SRS's target
 * vector store is MariaDB's native VECTOR column (11.8+); since this deployment's MariaDB
 * doesn't have that extension available, embeddings are stored as a JSON float array in
 * KbChunk.embedding (a TEXT column) and similarity is computed in-process (cosine
 * similarity) - functionally equivalent for this KB's size, swap for a native vector column
 * query later if the vector extension becomes available.
 */
@Service
@RequiredArgsConstructor
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper;

    public float[] embed(String text) {
        return embeddingModel.embed(text);
    }

    public String toJson(float[] vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize embedding vector", e);
        }
    }

    public float[] fromJson(String json) {
        try {
            return objectMapper.readValue(json, float[].class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize embedding vector", e);
        }
    }

    public double cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) {
            return 0.0;
        }
        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
