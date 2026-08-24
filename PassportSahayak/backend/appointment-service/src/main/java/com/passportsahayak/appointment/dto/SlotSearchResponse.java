package com.passportsahayak.appointment.dto;

import com.passportsahayak.appointment.entity.ServiceScheme;

import java.time.LocalDate;

public record SlotSearchResponse(
        Long centerId,
        String centerName,
        String city,
        LocalDate date,
        ServiceScheme category,
        int capacity,
        int booked,
        int available
) {
}
