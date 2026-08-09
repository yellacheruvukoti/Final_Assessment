package com.infy.user.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.user.dto.ApiResponse;
import com.infy.user.dto.InstructorCreateRequest;
import com.infy.user.dto.InstructorResponse;
import com.infy.user.dto.InstructorUpdateRequest;
import com.infy.user.service.AdminAuthorizationService;
import com.infy.user.service.InstructorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorService instructorService;
    private final AdminAuthorizationService adminAuthorizationService;

    /**
     * Internal contract (not gateway-routed) consumed by learning-service and
     * summary-service for ownership-authorization resolution.
     */
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<InstructorResponse>> getInstructorByUserId(@PathVariable UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Instructor retrieved successfully.", instructorService.getInstructorByUserId(userId)));
    }

    @GetMapping("/{instructorId}")
    public ResponseEntity<ApiResponse<InstructorResponse>> getInstructor(@PathVariable UUID instructorId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Instructor retrieved successfully.",
                        instructorService.getInstructor(instructorId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InstructorResponse>> createInstructor(
            @Valid @RequestBody InstructorCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role) {
        adminAuthorizationService.requireAdministrator(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Instructor created successfully.", instructorService.createInstructor(request)));
    }

    @PatchMapping("/{instructorId}")
    public ResponseEntity<ApiResponse<InstructorResponse>> updateInstructor(@PathVariable UUID instructorId,
            @Valid @RequestBody InstructorUpdateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role) {
        adminAuthorizationService.requireAdministrator(role);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Instructor updated successfully.",
                instructorService.updateInstructor(instructorId, request)));
    }

    @DeleteMapping("/{instructorId}")
    public ResponseEntity<ApiResponse<Void>> deactivateInstructor(@PathVariable UUID instructorId,
            @RequestHeader(value = "X-Role", required = false) String role) {
        adminAuthorizationService.requireAdministrator(role);
        instructorService.deactivateInstructor(instructorId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Instructor deactivated successfully.", null));
    }
}
