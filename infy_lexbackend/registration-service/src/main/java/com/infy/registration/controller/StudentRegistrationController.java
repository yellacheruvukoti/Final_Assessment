package com.infy.registration.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.registration.dto.ApiResponse;
import com.infy.registration.dto.RegistrationResponse;
import com.infy.registration.service.RegistrationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentRegistrationController {

    private final RegistrationService registrationService;

    @GetMapping("/{studentId}/registrations")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getStudentRegistrations(
            @PathVariable UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Student registrations retrieved successfully.",
                        registrationService.getStudentRegistrations(studentId)));
    }
}
