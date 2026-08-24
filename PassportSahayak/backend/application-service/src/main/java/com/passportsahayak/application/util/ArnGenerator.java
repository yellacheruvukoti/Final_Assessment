package com.passportsahayak.application.util;

import com.passportsahayak.application.repository.PassportApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;

/**
 * Generates an ARN shaped like the Passport Seva Programme's real format
 * (2 letters + 13 digits, e.g. AA1234567890123 per KB-PASS SRS PII examples).
 */
@Component
@RequiredArgsConstructor
public class ArnGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private final PassportApplicationRepository repository;

    public String generate() {
        String arn;
        do {
            long epochPart = Instant.now().getEpochSecond() % 10_000_000_000L; // 10 digits
            int randomPart = RANDOM.nextInt(1000); // 3 digits
            arn = "PS" + String.format("%010d", epochPart) + String.format("%03d", randomPart);
        } while (repository.existsByArn(arn));
        return arn;
    }
}
