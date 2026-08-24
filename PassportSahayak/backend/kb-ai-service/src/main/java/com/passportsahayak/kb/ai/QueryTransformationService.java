package com.passportsahayak.kb.ai;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Lightweight query-transformation step of the RAG pipeline (SRS Sec 2.1). Expands common
 * domain abbreviations to their full form so embedding similarity against KB text (which
 * spells things out) is stronger, without an extra LLM round-trip.
 */
@Service
public class QueryTransformationService {

    private static final Map<Pattern, String> EXPANSIONS = new LinkedHashMap<>();

    static {
        EXPANSIONS.put(Pattern.compile("\\bPV\\b"), "PV (Police Verification)");
        EXPANSIONS.put(Pattern.compile("\\bPSK\\b"), "PSK (Passport Seva Kendra)");
        EXPANSIONS.put(Pattern.compile("\\bPOPSK\\b"), "POPSK (Post Office Passport Seva Kendra)");
        EXPANSIONS.put(Pattern.compile("\\bRPO\\b"), "RPO (Regional Passport Office)");
        EXPANSIONS.put(Pattern.compile("\\bECR\\b"), "ECR (Emigration Check Required)");
        EXPANSIONS.put(Pattern.compile("\\bECNR\\b"), "ECNR (Emigration Check Not Required)");
        EXPANSIONS.put(Pattern.compile("\\bTatkal\\b", Pattern.CASE_INSENSITIVE), "Tatkal (expedited scheme)");
    }

    public String transform(String redactedQuery) {
        if (redactedQuery == null || redactedQuery.isBlank()) {
            return redactedQuery;
        }
        String result = redactedQuery.strip().replaceAll("\\s+", " ");
        for (Map.Entry<Pattern, String> entry : EXPANSIONS.entrySet()) {
            result = entry.getKey().matcher(result).replaceFirst(entry.getValue());
        }
        return result;
    }
}
