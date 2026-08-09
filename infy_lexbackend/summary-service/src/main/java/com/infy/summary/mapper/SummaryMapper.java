package com.infy.summary.mapper;

import com.infy.summary.dto.RegistrationSummaryResponse;
import com.infy.summary.entity.RegistrationSummaryView;

public final class SummaryMapper {

    private SummaryMapper() {
    }

    public static RegistrationSummaryResponse toResponse(RegistrationSummaryView view) {
        return RegistrationSummaryResponse.builder()
                .batchId(view.getBatchId())
                .totalRegistered(view.getTotalRegistered())
                .totalCancelled(view.getTotalCancelled())
                .generatedAt(view.getGeneratedAt())
                .build();
    }
}
