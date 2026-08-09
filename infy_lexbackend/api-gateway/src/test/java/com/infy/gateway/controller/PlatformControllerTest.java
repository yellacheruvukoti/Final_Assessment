package com.infy.gateway.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * TC-API-GATEWAY-001..002. Complements the live gateway verification already
 * performed (TASK-003/TASK-017: real process, real Consul registration, real
 * /actuator/gateway/routes inspection) with an automated regression test for
 * the platform endpoints. Self-defined test case IDs — test.md is empty.
 */
@WebFluxTest(controllers = PlatformController.class,
        excludeAutoConfiguration = org.springframework.cloud.gateway.config.GatewayAutoConfiguration.class)
class PlatformControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private WebTestClient webTestClient;

    @Test
    void tcApiGateway001_health_returnsUpStatus() {
        webTestClient.get().uri("/api/health")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.success").isEqualTo(true)
                .jsonPath("$.data.status").isEqualTo("UP");
    }

    @Test
    void tcApiGateway002_version_returnsPlatformName() {
        webTestClient.get().uri("/api/version")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data.platform").isEqualTo("Infy_LearnX");
    }
}
