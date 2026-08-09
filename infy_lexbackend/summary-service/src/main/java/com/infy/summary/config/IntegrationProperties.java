package com.infy.summary.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Outbound client timeout settings for summary-service dependencies
 * (registration-service), per plan.md Service Responsibility Matrix
 * "Configuration Requirements: ... timeout config".
 */
@Configuration
@ConfigurationProperties(prefix = "infy.summary.integration")
public class IntegrationProperties {

    private int registrationServiceTimeoutMs = 3000;

    public int getRegistrationServiceTimeoutMs() {
        return registrationServiceTimeoutMs;
    }

    public void setRegistrationServiceTimeoutMs(int registrationServiceTimeoutMs) {
        this.registrationServiceTimeoutMs = registrationServiceTimeoutMs;
    }
}
