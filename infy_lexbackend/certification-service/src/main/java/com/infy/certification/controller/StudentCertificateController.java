package com.infy.certification.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.certification.dto.ApiResponse;
import com.infy.certification.dto.CertificateResponse;
import com.infy.certification.service.CertificateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentCertificateController {

    private final CertificateService certificateService;

    @GetMapping("/{studentId}/certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> listByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Student certificates retrieved successfully.", certificateService.listByStudent(studentId)));
    }
}
