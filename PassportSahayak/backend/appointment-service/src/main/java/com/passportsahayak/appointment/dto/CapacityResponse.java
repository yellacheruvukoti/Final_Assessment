package com.passportsahayak.appointment.dto;

import java.time.LocalDate;

public record CapacityResponse(
        Long centerId,
        String centerName,
        LocalDate date,
        int normalCapacity,
        int normalBooked,
        int tatkalCapacity,
        int tatkalBooked
) {
}
