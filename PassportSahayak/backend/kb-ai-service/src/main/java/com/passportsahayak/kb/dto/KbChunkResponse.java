package com.passportsahayak.kb.dto;

import com.passportsahayak.kb.entity.EmbeddingStatus;
import com.passportsahayak.kb.entity.KbChunk;

public record KbChunkResponse(
        Long id,
        int chunkIndex,
        String content,
        EmbeddingStatus embeddingStatus
) {
    public static KbChunkResponse from(KbChunk c) {
        return new KbChunkResponse(c.getId(), c.getChunkIndex(), c.getContent(), c.getEmbeddingStatus());
    }
}
