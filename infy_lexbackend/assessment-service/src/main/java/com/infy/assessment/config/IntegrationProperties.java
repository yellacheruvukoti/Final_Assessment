package com.infy.assessment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Outbound timeout for validating Assessment.scopeId against the owning
 * service (learning-service for COURSE scope, user-service for BATCH scope)
 * at create time.
 */
@Configuration
@ConfigurationProperties(prefix = "infy.assessment.integration")
public class IntegrationProperties {

    private int courseServiceTimeoutMs = 3000;
    private int batchServiceTimeoutMs = 3000;

    public int getCourseServiceTimeoutMs() {
        return courseServiceTimeoutMs;
    }

    public void setCourseServiceTimeoutMs(int courseServiceTimeoutMs) {
        this.courseServiceTimeoutMs = courseServiceTimeoutMs;
    }

    public int getBatchServiceTimeoutMs() {
        return batchServiceTimeoutMs;
    }

    public void setBatchServiceTimeoutMs(int batchServiceTimeoutMs) {
        this.batchServiceTimeoutMs = batchServiceTimeoutMs;
    }
}
