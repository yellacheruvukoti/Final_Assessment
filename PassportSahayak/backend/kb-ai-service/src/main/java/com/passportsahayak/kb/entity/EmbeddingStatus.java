package com.passportsahayak.kb.entity;

/**
 * Every chunk stays PENDING until the Spring AI + Azure OpenAI embedding pipeline is
 * wired in (deferred until AI credentials are supplied).
 */
public enum EmbeddingStatus {
    PENDING,
    EMBEDDED,
    FAILED
}
