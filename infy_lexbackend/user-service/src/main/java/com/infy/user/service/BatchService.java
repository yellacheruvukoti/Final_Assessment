package com.infy.user.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.user.dto.BatchCreateRequest;
import com.infy.user.dto.BatchResponse;
import com.infy.user.exception.BusinessException;
import com.infy.user.mapper.BatchMapper;
import com.infy.user.repository.BatchRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;

    public BatchResponse createBatch(BatchCreateRequest request) {
        return BatchMapper.toResponse(batchRepository.save(BatchMapper.toEntity(request)));
    }

    /**
     * Internal contract (not gateway-routed) consumed by summary-service to
     * resolve batch ownership for authorization (VR-010).
     */
    public BatchResponse getBatch(UUID batchId) {
        return batchRepository.findById(batchId)
                .map(BatchMapper::toResponse)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "BATCH_NOT_FOUND",
                        "Batch not found for id " + batchId));
    }

    public List<BatchResponse> listBatches() {
        return batchRepository.findAll().stream().map(BatchMapper::toResponse).toList();
    }
}
