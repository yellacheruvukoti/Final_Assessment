package com.infy.certification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Certificate issuance and outbound client settings, per plan.md Service
 * Responsibility Matrix "Configuration Requirements: Score threshold config,
 * token config, timeout config" and clarification.md Section 13 (minimum
 * 60 percent score required).
 */
@Configuration
@ConfigurationProperties(prefix = "infy.certification")
public class CertificationProperties {

    private double scoreThreshold = 60.0;
    private String downloadTokenPrefix = "dlt-";
    private final Integration integration = new Integration();

    public double getScoreThreshold() {
        return scoreThreshold;
    }

    public void setScoreThreshold(double scoreThreshold) {
        this.scoreThreshold = scoreThreshold;
    }

    public String getDownloadTokenPrefix() {
        return downloadTokenPrefix;
    }

    public void setDownloadTokenPrefix(String downloadTokenPrefix) {
        this.downloadTokenPrefix = downloadTokenPrefix;
    }

    public Integration getIntegration() {
        return integration;
    }

    public static class Integration {
        private int assessmentServiceTimeoutMs = 3000;
        private int userServiceTimeoutMs = 3000;

        public int getAssessmentServiceTimeoutMs() {
            return assessmentServiceTimeoutMs;
        }

        public void setAssessmentServiceTimeoutMs(int assessmentServiceTimeoutMs) {
            this.assessmentServiceTimeoutMs = assessmentServiceTimeoutMs;
        }

        public int getUserServiceTimeoutMs() {
            return userServiceTimeoutMs;
        }

        public void setUserServiceTimeoutMs(int userServiceTimeoutMs) {
            this.userServiceTimeoutMs = userServiceTimeoutMs;
        }
    }
}
