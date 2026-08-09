package com.infy.gateway.dto;

public class ApiError {

    private String code;
    private String message;
    private Object details;
    private String correlationId;

    public ApiError() {
    }

    public ApiError(String code, String message, Object details, String correlationId) {
        this.code = code;
        this.message = message;
        this.details = details;
        this.correlationId = correlationId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getDetails() {
        return details;
    }

    public void setDetails(Object details) {
        this.details = details;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
}
