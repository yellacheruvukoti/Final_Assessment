package com.infy.user.mapper;

import com.infy.user.dto.BatchCreateRequest;
import com.infy.user.dto.BatchResponse;
import com.infy.user.entity.Batch;

public final class BatchMapper {

    private BatchMapper() {
    }

    public static Batch toEntity(BatchCreateRequest request) {
        return Batch.builder()
                .batchCode(request.getBatchCode())
                .batchName(request.getBatchName())
                .ownerId(request.getOwnerId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status("ACTIVE")
                .build();
    }

    public static BatchResponse toResponse(Batch batch) {
        return BatchResponse.builder()
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .batchName(batch.getBatchName())
                .ownerId(batch.getOwnerId())
                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .status(batch.getStatus())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();
    }
}
