package com.passportsahayak.appointment.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record RescheduleRequest(
        @NotNull @Future LocalDate newAppointmentDate,
        @NotNull LocalTime newAppointmentTime
) {
}
