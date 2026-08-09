package com.infy.user.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

/**
 * Single exception type carrying a stable business error code and HTTP
 * status, per constitution.md Section 13 (minimum error classification:
 * validation, authorization, not-found, duplicate conflict, dependency
 * unavailable, internal error — all representable via status+code here).
 */
@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public BusinessException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
