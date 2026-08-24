package com.passportsahayak.application.dto;

import com.passportsahayak.application.entity.TatkalReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public record EligibilityCheckRequest(
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull ExistingPassportStatus existingPassportStatus,
        LocalDate existingPassportIssueDate,
        LocalDate existingPassportExpiryDate,
        boolean addressChangedSinceLastPassport,
        boolean pagesExhausted,
        TatkalReason tatkalReason,
        Integer travelWithinDays
) {
}
