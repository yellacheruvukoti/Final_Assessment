package com.passportsahayak.kb.dto;

public record Citation(
        String docCode,
        String title,
        int chunkIndex,
        double similarity
) {
}
