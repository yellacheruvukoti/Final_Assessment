package com.passportsahayak.kb.dto;

import java.time.LocalDate;

public record IngestMetadata(
        String docCode,
        String version,
        String audience,
        LocalDate effectiveDate,
        String tags
) {
}
