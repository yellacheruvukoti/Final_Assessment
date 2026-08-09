package com.infy.user.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.user.dto.AdministratorResponse;
import com.infy.user.dto.ApiResponse;
import com.infy.user.service.AdministratorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/administrators")
@RequiredArgsConstructor
public class AdministratorController {

    private final AdministratorService administratorService;

    @GetMapping("/{administratorId}")
    public ResponseEntity<ApiResponse<AdministratorResponse>> getAdministrator(@PathVariable UUID administratorId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Administrator retrieved successfully.",
                        administratorService.getAdministrator(administratorId)));
    }
}
