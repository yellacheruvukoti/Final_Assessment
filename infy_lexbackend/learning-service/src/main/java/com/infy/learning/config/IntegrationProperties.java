package com.infy.learning.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Outbound timeout for the ownership-authorization lookup to user-service
 * (Course.instructorId / Quiz.ownerInstructorId store the Instructor
 * profile id, so requester identity must be resolved from X-User-Id).
 */
@Configuration
@ConfigurationProperties(prefix = "infy.learning.integration")
public class IntegrationProperties {

    private int userServiceTimeoutMs = 3000;

    public int getUserServiceTimeoutMs() {
        return userServiceTimeoutMs;
    }

    public void setUserServiceTimeoutMs(int userServiceTimeoutMs) {
        this.userServiceTimeoutMs = userServiceTimeoutMs;
    }
}
