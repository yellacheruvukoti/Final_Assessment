package com.passportsahayak.appointment.dto;

import com.passportsahayak.appointment.entity.ServiceScheme;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookAppointmentRequest(
        @NotBlank String arn,
        @NotNull Long centerId,
        @NotNull @Future LocalDate appointmentDate,
        @NotNull LocalTime appointmentTime,
        @NotNull ServiceScheme category
) {
}
