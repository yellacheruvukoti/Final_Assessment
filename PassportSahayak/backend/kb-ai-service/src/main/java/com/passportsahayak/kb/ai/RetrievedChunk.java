package com.passportsahayak.kb.ai;

public record RetrievedChunk(
        Long chunkId,
        int chunkIndex,
        String content,
        String docCode,
        String docTitle,
        double similarity
) {
}
