package com.infy.registration.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Outbound client timeout settings for registration-service dependencies
 * (user-service, assessment-service), per plan.md Service Responsibility
 * Matrix "Configuration Requirements: ... timeout config".
 */
@Configuration
@ConfigurationProperties(prefix = "infy.registration.integration")
public class IntegrationProperties {

    private int userServiceTimeoutMs = 3000;
    private int assessmentServiceTimeoutMs = 3000;

    public int getUserServiceTimeoutMs() {
        return userServiceTimeoutMs;
    }

    public void setUserServiceTimeoutMs(int userServiceTimeoutMs) {
        this.userServiceTimeoutMs = userServiceTimeoutMs;
    }

    public int getAssessmentServiceTimeoutMs() {
        return assessmentServiceTimeoutMs;
    }

    public void setAssessmentServiceTimeoutMs(int assessmentServiceTimeoutMs) {
        this.assessmentServiceTimeoutMs = assessmentServiceTimeoutMs;
    }
}
