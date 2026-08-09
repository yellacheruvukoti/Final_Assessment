package com.infy.gateway.filter;

import java.util.UUID;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import reactor.core.publisher.Mono;

/**
 * Cross-cutting concern only: ensures every request/response carries a
 * correlation id for tracing. No domain/business logic per constitution.md
 * Section 5 (Gateway must not implement domain business rules).
 *
 * Implemented as a plain WebFilter (not a Spring Cloud Gateway GlobalFilter)
 * because GlobalFilter only executes once a route has been matched; a
 * WebFilter runs for every request, including unmatched routes (404) and
 * gateway-local endpoints such as /actuator, so the correlation id is always
 * present.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdGlobalFilter implements WebFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String correlationId = exchange.getRequest().getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(CORRELATION_ID_HEADER, correlationId)
                .build();

        exchange.getResponse().getHeaders().add(CORRELATION_ID_HEADER, correlationId);

        ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();
        return chain.filter(mutatedExchange);
    }
}
