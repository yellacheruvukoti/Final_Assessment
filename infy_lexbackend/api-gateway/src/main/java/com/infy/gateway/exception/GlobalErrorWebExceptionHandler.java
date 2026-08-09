package com.infy.gateway.exception;

import java.io.IOException;
import java.net.ConnectException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infy.gateway.dto.ApiError;
import com.infy.gateway.dto.ApiResponse;
import com.infy.gateway.filter.CorrelationIdGlobalFilter;

import org.springframework.cloud.gateway.support.NotFoundException;

import reactor.core.publisher.Mono;

/**
 * Standardizes error propagation for gateway-level failures (route not
 * resolved, downstream unreachable, unexpected errors) into the platform's
 * common response envelope. Cross-cutting concern only, no domain business
 * logic, per constitution.md Section 5.
 */
@Component
@Order(-2)
public class GlobalErrorWebExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    public GlobalErrorWebExceptionHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();
        if (response.isCommitted()) {
            return Mono.error(ex);
        }

        ResolvedError resolved = resolve(ex);
        response.setStatusCode(resolved.status());
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String correlationId = exchange.getRequest().getHeaders()
                .getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER);

        ApiError apiError = new ApiError(resolved.code(), resolved.message(), null, correlationId);
        ApiResponse<Object> body = ApiResponse.error(resolved.message(), apiError);

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(body);
        } catch (IOException e) {
            bytes = "{\"success\":false,\"message\":\"Gateway response could not be serialized.\"}"
                    .getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    private ResolvedError resolve(Throwable ex) {
        if (ex instanceof NotFoundException) {
            return new ResolvedError(HttpStatus.NOT_FOUND, "GATEWAY_ROUTE_ERROR",
                    "No downstream route could be resolved for this request.");
        }
        if (ex instanceof ResponseStatusException rse) {
            HttpStatus status = HttpStatus.resolve(rse.getStatusCode().value());
            if (status == null) {
                status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
            if (status == HttpStatus.SERVICE_UNAVAILABLE) {
                return new ResolvedError(status, "DEPENDENCY_UNAVAILABLE",
                        "The requested service is temporarily unavailable. Please try again shortly.");
            }
            if (status == HttpStatus.NOT_FOUND) {
                return new ResolvedError(status, "GATEWAY_ROUTE_ERROR",
                        "No downstream route could be resolved for this request.");
            }
            String message = rse.getReason() != null ? rse.getReason() : "Gateway request could not be processed.";
            return new ResolvedError(status, "GATEWAY_ERROR", message);
        }
        if (isConnectivityFailure(ex)) {
            return new ResolvedError(HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE",
                    "The requested service is temporarily unavailable. Please try again shortly.");
        }
        return new ResolvedError(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected gateway error occurred.");
    }

    private boolean isConnectivityFailure(Throwable ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof ConnectException || cause instanceof TimeoutException) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    private record ResolvedError(HttpStatus status, String code, String message) {
    }
}
