package com.infy.gateway.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.gateway.dto.ApiResponse;

import reactor.core.publisher.Mono;

/**
 * Health and Platform Routes (api-contract.md Section 3.6). Served directly
 * by the gateway since they are platform metadata, not domain business
 * logic (constitution.md Section 5).
 */
@RestController
public class PlatformController {

    @GetMapping("/api/health")
    public Mono<ApiResponse<Map<String, String>>> health() {
        return Mono.just(ApiResponse.success("Gateway is healthy.", Map.of("status", "UP")));
    }

    @GetMapping("/api/version")
    public Mono<ApiResponse<Map<String, String>>> version() {
        return Mono.just(ApiResponse.success("Version retrieved successfully.",
                Map.of("platform", "Infy_LearnX", "version", "0.0.1-SNAPSHOT")));
    }
}
