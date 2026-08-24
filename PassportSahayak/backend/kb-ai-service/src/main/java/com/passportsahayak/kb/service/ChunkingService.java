package com.passportsahayak.kb.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Naive, non-AI paragraph-aware text chunker used at ingestion time. Embedding of these
 * chunks (Spring AI + Azure OpenAI) is deferred until AI credentials are configured -
 * see {@link com.passportsahayak.kb.entity.EmbeddingStatus}.
 */
@Service
public class ChunkingService {

    public List<String> chunk(String text, int maxChars) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        String[] paragraphs = text.strip().split("\\n\\s*\\n");
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            String p = paragraph.strip();
            if (p.isEmpty()) {
                continue;
            }
            if (p.length() > maxChars) {
                if (current.length() > 0) {
                    chunks.add(current.toString().strip());
                    current.setLength(0);
                }
                chunks.addAll(splitLong(p, maxChars));
                continue;
            }
            if (current.length() + p.length() + 2 > maxChars) {
                chunks.add(current.toString().strip());
                current.setLength(0);
            }
            if (current.length() > 0) {
                current.append("\n\n");
            }
            current.append(p);
        }
        if (current.length() > 0) {
            chunks.add(current.toString().strip());
        }
        return chunks;
    }

    private List<String> splitLong(String text, int maxChars) {
        List<String> parts = new ArrayList<>();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + maxChars, text.length());
            if (end < text.length()) {
                int lastSpace = text.lastIndexOf(' ', end);
                if (lastSpace > start) {
                    end = lastSpace;
                }
            }
            parts.add(text.substring(start, end).strip());
            start = end;
        }
        return parts;
    }
}
