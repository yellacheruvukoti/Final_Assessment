package com.passportsahayak.kb.ai;

import com.passportsahayak.kb.dto.Citation;
import reactor.core.publisher.Flux;

import java.util.List;

public record ChatStreamHandle(
        String sessionId,
        List<Citation> citations,
        Flux<String> tokens
) {
}
