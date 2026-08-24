package com.passportsahayak.kb.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        String sessionId,
        @NotBlank String query,
        /** Structured field, NOT parsed from free text - see AiRequestContext for why. */
        String arn
) {
}
