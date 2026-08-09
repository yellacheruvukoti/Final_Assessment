package com.infy.registration.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.registration.dto.ApiResponse;
import com.infy.registration.dto.RegistrationCreateRequest;
import com.infy.registration.dto.RegistrationResponse;
import com.infy.registration.service.RegistrationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(
            @Valid @RequestBody RegistrationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration created successfully.", registrationService.register(request)));
    }

    /**
     * Internal contract (not gateway-routed) consumed by summary-service.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> listByStudentIds(
            @RequestParam(required = false) List<UUID> studentIds) {
        List<RegistrationResponse> registrations = studentIds == null ? List.of()
                : registrationService.getRegistrationsByStudentIds(studentIds);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Registrations retrieved successfully.", registrations));
    }

    @GetMapping("/{registrationId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getRegistration(@PathVariable UUID registrationId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Registration retrieved successfully.",
                        registrationService.getRegistration(registrationId)));
    }

    @PatchMapping("/{registrationId}/cancel")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancel(@PathVariable UUID registrationId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Registration cancelled successfully.",
                        registrationService.cancel(registrationId)));
    }

    @PatchMapping("/{registrationId}/reregister")
    public ResponseEntity<ApiResponse<RegistrationResponse>> reregister(@PathVariable UUID registrationId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Registration reactivated successfully.",
                        registrationService.reregister(registrationId)));
    }
}
