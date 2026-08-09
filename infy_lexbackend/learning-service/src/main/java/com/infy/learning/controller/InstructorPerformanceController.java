package com.infy.learning.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.learning.dto.ApiResponse;
import com.infy.learning.dto.InstructorPerformanceResponse;
import com.infy.learning.service.InstructorPerformanceService;

import lombok.RequiredArgsConstructor;

/**
 * Note: /api/instructors/{instructorId} (profile) is owned by user-service;
 * only the /performance sub-resource is owned by learning-service. The
 * gateway route catalog (TASK-017) must route this specific, more specific
 * path to learning-service ahead of the general /api/instructors/** rule.
 */
@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
public class InstructorPerformanceController {

    private final InstructorPerformanceService instructorPerformanceService;

    @GetMapping("/{instructorId}/performance")
    public ResponseEntity<ApiResponse<InstructorPerformanceResponse>> getPerformance(
            @PathVariable UUID instructorId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Instructor performance retrieved successfully.",
                instructorPerformanceService.getPerformance(instructorId, role, userId)));
    }
}
