package com.infy.user.exception;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.infy.user.dto.ApiError;
import com.infy.user.dto.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException ex,
            HttpServletRequest request) {
        ApiError error = new ApiError(ex.getCode(), ex.getMessage(), null, correlationId(request));
        return ResponseEntity.status(ex.getStatus()).body(ApiResponse.error(ex.getMessage(), error));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
        String message = "Request validation failed.";
        ApiError error = new ApiError("VALIDATION_ERROR", message, details, correlationId(request));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(message, error));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnreadable(HttpMessageNotReadableException ex,
            HttpServletRequest request) {
        String message = "Request body is missing or malformed.";
        ApiError error = new ApiError("VALIDATION_ERROR", message, null, correlationId(request));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(message, error));
    }

    /**
     * A malformed path/query value (e.g. a non-UUID string where a UUID is
     * expected) is a structural request problem, not a server failure — must
     * map to 400 VALIDATION_ERROR per api-contract.md Section 6, not the
     * generic 500 INTERNAL_ERROR fallback below.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {
        String message = "Request parameter '" + ex.getName() + "' has an invalid value.";
        ApiError error = new ApiError("VALIDATION_ERROR", message, null, correlationId(request));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(message, error));
    }

    /**
     * Thrown by Spring MVC's static-resource fallback when no controller
     * mapping matches the request path (e.g. GET /api/users with no id
     * segment). This is a client routing error, not a server failure — must
     * map to 404 ROUTE_NOT_FOUND, not the generic 500 INTERNAL_ERROR fallback
     * below, which previously misreported every unmapped route as a crash.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNoResourceFound(NoResourceFoundException ex,
            HttpServletRequest request) {
        String message = "The requested resource or endpoint does not exist.";
        ApiError error = new ApiError("ROUTE_NOT_FOUND", message, null, correlationId(request));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(message, error));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request) {
        String message = "HTTP method '" + ex.getMethod() + "' is not supported for this endpoint.";
        ApiError error = new ApiError("METHOD_NOT_ALLOWED", message, null, correlationId(request));
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(ApiResponse.error(message, error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {} {}", request.getMethod(), request.getRequestURI(), ex);
        String message = "An unexpected error occurred.";
        ApiError error = new ApiError("INTERNAL_ERROR", message, null, correlationId(request));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(message, error));
    }

    private String correlationId(HttpServletRequest request) {
        return request.getHeader(CORRELATION_ID_HEADER);
    }
}
