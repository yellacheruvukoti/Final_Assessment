package com.infy.user.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.user.dto.ApiResponse;
import com.infy.user.dto.BatchResponse;
import com.infy.user.service.BatchService;

import lombok.RequiredArgsConstructor;

/**
 * getBatch is an internal contract (not gateway-routed) consumed by
 * summary-service to resolve batch ownership for authorization (VR-010).
 * listBatches is gateway-routed for the admin UI's batch picker.
 */
@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BatchResponse>>> listBatches() {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Batches retrieved successfully.", batchService.listBatches()));
    }

    @GetMapping("/{batchId}")
    public ResponseEntity<ApiResponse<BatchResponse>> getBatch(@PathVariable UUID batchId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Batch retrieved successfully.", batchService.getBatch(batchId)));
    }
}
