package com.passportsahayak.kb.ai;

/** Structured output the LLM is asked to produce (parsed via Spring AI's entity converter). */
public record ChatModelOutput(
        String answer,
        boolean escalated
) {
}
