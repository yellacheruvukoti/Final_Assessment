package com.passportsahayak.application.dto;

import com.passportsahayak.application.entity.ApplicationType;
import com.passportsahayak.application.entity.BookletType;
import com.passportsahayak.application.entity.ServiceScheme;
import com.passportsahayak.application.entity.TatkalReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public record CreateApplicationRequest(
        @NotNull ApplicationType applicationType,
        @NotNull ServiceScheme serviceScheme,
        @NotNull BookletType bookletType,
        @NotNull @Past LocalDate dateOfBirth,
        TatkalReason tatkalReason
) {
}
