package com.passportsahayak.kb.dto;

import java.util.List;

public record ChatResponse(
        String sessionId,
        String answer,
        boolean escalated,
        List<Citation> citations
) {
    public static ChatResponse noMatch(String sessionId) {
        return new ChatResponse(sessionId,
                "No matching policy found. Please contact your nearest PSK/RPO.",
                true, List.of());
    }
}
