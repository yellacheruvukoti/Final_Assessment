package com.passportsahayak.kb.ai;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * PII detection & redaction per SRS Sec 4.1.6. Applied as the very first step of the RAG
 * pipeline (Query -> PII Redaction -> ...), before anything is sent to the LLM. Patterns
 * are best-effort regexes matching the SRS's own example format for each PII type.
 */
@Service
public class PiiRedactionService {

    private record Rule(Pattern pattern, String token) {
    }

    // Order matters: most specific/unambiguous patterns first, broad ones (address) last.
    private static final Rule[] RULES = new Rule[]{
            new Rule(Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"), "[EMAIL-REDACTED]"),
            new Rule(Pattern.compile("\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b"), "[AADHAAR-REDACTED]"),
            new Rule(Pattern.compile("\\b[A-Z]{5}\\d{4}[A-Z]\\b"), "[PAN-REDACTED]"),
            new Rule(Pattern.compile("\\b[A-Z]{2}\\d{13}\\b"), "[ARN-REDACTED]"),
            new Rule(Pattern.compile("\\b[A-Z]\\d{7}\\b"), "[PASSPORT-NO-REDACTED]"),
            new Rule(Pattern.compile("(?:\\+91[\\s-]?)?\\b[6-9]\\d{4}[\\s-]?\\d{5}\\b"), "[PHONE-REDACTED]"),
            new Rule(Pattern.compile("\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b"), "[DOB-REDACTED]"),
            new Rule(Pattern.compile("\\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{1,2}[,\\s]+\\d{4}\\b", Pattern.CASE_INSENSITIVE), "[DOB-REDACTED]"),
            new Rule(Pattern.compile("\\b[\\w.-]+(?:\\s+[\\w.-]+){1,6},[^.]{0,60}?\\b\\d{6}\\b"), "[ADDRESS-REDACTED]"),
    };

    public String redact(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }
        String result = text;
        for (Rule rule : RULES) {
            result = rule.pattern().matcher(result).replaceAll(rule.token());
        }
        return result;
    }

    /** Redaction token reference, exposed mainly for tests/diagnostics. */
    public Map<String, String> tokenGlossary() {
        Map<String, String> glossary = new LinkedHashMap<>();
        glossary.put("Application Reference No. (ARN)", "[ARN-REDACTED]");
        glossary.put("Passport Number", "[PASSPORT-NO-REDACTED]");
        glossary.put("Aadhaar Number", "[AADHAAR-REDACTED]");
        glossary.put("PAN Card Number", "[PAN-REDACTED]");
        glossary.put("Personal Phone Number", "[PHONE-REDACTED]");
        glossary.put("Personal Email Address", "[EMAIL-REDACTED]");
        glossary.put("Home Address", "[ADDRESS-REDACTED]");
        glossary.put("Date of Birth", "[DOB-REDACTED]");
        return glossary;
    }
}
