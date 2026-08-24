package com.passportsahayak.pv.dto;

import jakarta.validation.constraints.NotBlank;

public record DispatchPvCaseRequest(
        @NotBlank String arn,
        boolean governmentServant,
        boolean seniorCitizen,
        boolean courtDirected,
        boolean addressChangedSinceLastPassport,
        @NotBlank String district,
        @NotBlank String state
) {
}
