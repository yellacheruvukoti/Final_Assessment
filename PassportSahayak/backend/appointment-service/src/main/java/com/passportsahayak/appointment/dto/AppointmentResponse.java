package com.passportsahayak.appointment.dto;

import com.passportsahayak.appointment.entity.Appointment;
import com.passportsahayak.appointment.entity.AppointmentStatus;
import com.passportsahayak.appointment.entity.ServiceScheme;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentResponse(
        Long id,
        String arn,
        Long centerId,
        String centerName,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        ServiceScheme category,
        AppointmentStatus status,
        int rescheduleCount,
        String note,
        Instant createdAt,
        Instant updatedAt
) {
    public static AppointmentResponse from(Appointment a) {
        return from(a, null);
    }

    public static AppointmentResponse from(Appointment a, String note) {
        return new AppointmentResponse(a.getId(), a.getArn(), a.getCenter().getId(), a.getCenter().getName(),
                a.getAppointmentDate(), a.getAppointmentTime(), a.getCategory(), a.getStatus(),
                a.getRescheduleCount(), note, a.getCreatedAt(), a.getUpdatedAt());
    }
}
