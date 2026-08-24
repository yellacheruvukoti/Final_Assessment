package com.passportsahayak.appointment.repository;

import com.passportsahayak.appointment.entity.Appointment;
import com.passportsahayak.appointment.entity.AppointmentStatus;
import com.passportsahayak.appointment.entity.ServiceScheme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByArn(String arn);
    List<Appointment> findByApplicantUserIdOrderByCreatedAtDesc(Long applicantUserId);

    long countByCenterIdAndAppointmentDateAndCategoryAndStatusIn(
            Long centerId, LocalDate appointmentDate, ServiceScheme category, List<AppointmentStatus> statuses);

    List<Appointment> findByCenterIdAndAppointmentDate(Long centerId, LocalDate appointmentDate);
}
