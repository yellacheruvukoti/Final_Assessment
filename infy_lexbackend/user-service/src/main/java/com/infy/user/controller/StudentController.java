package com.infy.user.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.user.dto.ApiResponse;
import com.infy.user.dto.StudentBatchResponse;
import com.infy.user.dto.StudentCreateRequest;
import com.infy.user.dto.StudentResponse;
import com.infy.user.dto.StudentStatusResponse;
import com.infy.user.dto.StudentUpdateRequest;
import com.infy.user.service.AdminAuthorizationService;
import com.infy.user.service.StudentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final AdminAuthorizationService adminAuthorizationService;

    /**
     * Internal contract (not gateway-routed): batchId filter is consumed by
     * summary-service to resolve a batch's student ids.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentResponse>>> listStudents(
            @RequestParam(required = false) UUID batchId) {
        List<StudentResponse> students = batchId == null ? List.of() : studentService.getStudentsByBatch(batchId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Students retrieved successfully.", students));
    }

    /**
     * Internal contract (not gateway-routed) consumed by learning-service.
     */
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentByUserId(@PathVariable UUID userId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Student retrieved successfully.", studentService.getStudentByUserId(userId)));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudent(@PathVariable UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Student retrieved successfully.", studentService.getStudent(studentId)));
    }

    @GetMapping("/{studentId}/batch")
    public ResponseEntity<ApiResponse<StudentBatchResponse>> getStudentBatch(@PathVariable UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Student batch retrieved successfully.",
                        studentService.getStudentBatch(studentId)));
    }

    /**
     * Internal contract (not gateway-routed) consumed by registration-service
     * and certification-service for student existence/active validation.
     */
    @GetMapping("/{studentId}/status")
    public ResponseEntity<ApiResponse<StudentStatusResponse>> getStudentStatus(@PathVariable UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Student status retrieved successfully.",
                        studentService.getStudentStatus(studentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @Valid @RequestBody StudentCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role) {
        adminAuthorizationService.requireAdministrator(role);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created successfully.", studentService.createStudent(request)));
    }

    @PatchMapping("/{studentId}")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(@PathVariable UUID studentId,
            @Valid @RequestBody StudentUpdateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role) {
        adminAuthorizationService.requireAdministrator(role);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Student updated successfully.", studentService.updateStudent(studentId, request)));
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<ApiResponse<Void>> deactivateStudent(@PathVariable UUID studentId,
            @RequestHeader(value = "X-Role", required = false) String role) {
        adminAuthorizationService.requireAdministrator(role);
        studentService.deactivateStudent(studentId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Student deactivated successfully.", null));
    }
}
