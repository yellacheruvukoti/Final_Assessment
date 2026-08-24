package com.passportsahayak.application.dto;

public record DocumentChecklistItem(
        String document,
        boolean mandatory,
        String note
) {
}
