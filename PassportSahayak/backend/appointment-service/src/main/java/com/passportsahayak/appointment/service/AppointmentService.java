package com.passportsahayak.appointment.service;

import com.passportsahayak.appointment.client.ApplicationServiceClient;
import com.passportsahayak.appointment.client.ApplicationView;
import com.passportsahayak.appointment.dto.AppointmentResponse;
import com.passportsahayak.appointment.dto.BookAppointmentRequest;
import com.passportsahayak.appointment.dto.CapacityResponse;
import com.passportsahayak.appointment.dto.RescheduleRequest;
import com.passportsahayak.appointment.dto.SlotSearchResponse;
import com.passportsahayak.appointment.entity.Appointment;
import com.passportsahayak.appointment.entity.AppointmentStatus;
import com.passportsahayak.appointment.entity.PskCenter;
import com.passportsahayak.appointment.entity.ServiceScheme;
import com.passportsahayak.appointment.exception.ApiException;
import com.passportsahayak.appointment.repository.AppointmentRepository;
import com.passportsahayak.appointment.repository.PskCenterRepository;
import com.passportsahayak.appointment.security.AuthenticatedUser;
import com.passportsahayak.appointment.util.WorkingDays;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final List<AppointmentStatus> ACTIVE_STATUSES = List.of(AppointmentStatus.BOOKED, AppointmentStatus.RESCHEDULED, AppointmentStatus.COMPLETED);
    private static final Set<String> FRESH_TYPES = Set.of("FRESH");
    private static final Set<String> RENEWAL_TYPES = Set.of("REISSUE_RENEWAL", "REISSUE_LOST_DAMAGED", "REISSUE_NAME_CHANGE");

    private final AppointmentRepository appointmentRepository;
    private final PskCenterRepository centerRepository;
    private final ApplicationServiceClient applicationServiceClient;

    @Value("${app.appointment.reschedule-max-count}")
    private int rescheduleMaxCount;

    @Value("${app.appointment.reschedule-cutoff-working-days}")
    private int rescheduleCutoffWorkingDays;

    @Value("${app.appointment.reschedule-second-fee}")
    private int rescheduleSecondFee;

    public List<SlotSearchResponse> searchSlots(Long centerId, LocalDate date, ServiceScheme category) {
        List<PskCenter> centers = centerId != null
                ? List.of(centerRepository.findById(centerId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Center not found")))
                : centerRepository.findByActiveTrue();

        return centers.stream().map(c -> {
            int capacity = capacityFor(c, category);
            long booked = appointmentRepository.countByCenterIdAndAppointmentDateAndCategoryAndStatusIn(c.getId(), date, category, ACTIVE_STATUSES);
            return new SlotSearchResponse(c.getId(), c.getName(), c.getCity(), date, category, capacity, (int) booked, Math.max(0, capacity - (int) booked));
        }).toList();
    }

    public CapacityResponse capacity(Long centerId, LocalDate date) {
        PskCenter center = centerRepository.findById(centerId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Center not found"));
        int normalCap = capacityFor(center, ServiceScheme.NORMAL);
        int tatkalCap = capacityFor(center, ServiceScheme.TATKAL);
        long normalBooked = appointmentRepository.countByCenterIdAndAppointmentDateAndCategoryAndStatusIn(centerId, date, ServiceScheme.NORMAL, ACTIVE_STATUSES);
        long tatkalBooked = appointmentRepository.countByCenterIdAndAppointmentDateAndCategoryAndStatusIn(centerId, date, ServiceScheme.TATKAL, ACTIVE_STATUSES);
        return new CapacityResponse(centerId, center.getName(), date, normalCap, (int) normalBooked, tatkalCap, (int) tatkalBooked);
    }

    @Transactional
    public AppointmentResponse bookFresh(AuthenticatedUser principal, BookAppointmentRequest req, String authHeader) {
        return book(principal, req, authHeader, FRESH_TYPES, "Fresh");
    }

    @Transactional
    public AppointmentResponse bookRenewal(AuthenticatedUser principal, BookAppointmentRequest req, String authHeader) {
        return book(principal, req, authHeader, RENEWAL_TYPES, "Renewal/Reissue");
    }

    private AppointmentResponse book(AuthenticatedUser principal, BookAppointmentRequest req, String authHeader,
                                      Set<String> allowedTypes, String label) {
        ApplicationView application = applicationServiceClient.getByArn(req.arn(), authHeader);

        if (!application.applicantUserId().equals(principal.userId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This application does not belong to you");
        }
        if (!allowedTypes.contains(application.applicationType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ARN " + req.arn() + " is not a " + label + " application");
        }
        if (!"SUBMITTED".equals(application.status())) {
            throw new ApiException(HttpStatus.CONFLICT, "Application must be in SUBMITTED status to book an appointment (current: " + application.status() + ")");
        }
        if (!application.serviceScheme().equals(req.category().name())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Requested slot category (" + req.category() + ") does not match the application's service scheme (" + application.serviceScheme() + ")");
        }
        appointmentRepository.findByArn(req.arn()).ifPresent(a -> {
            if (ACTIVE_STATUSES.contains(a.getStatus())) {
                throw new ApiException(HttpStatus.CONFLICT, "An active appointment already exists for this ARN");
            }
        });

        PskCenter center = centerRepository.findById(req.centerId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Center not found"));

        ensureCapacityAvailable(center, req.appointmentDate(), req.category());

        Appointment appointment = Appointment.builder()
                .arn(req.arn())
                .applicantUserId(principal.userId())
                .center(center)
                .appointmentDate(req.appointmentDate())
                .appointmentTime(req.appointmentTime())
                .category(req.category())
                .status(AppointmentStatus.BOOKED)
                .rescheduleCount(0)
                .build();
        appointment = appointmentRepository.save(appointment);

        applicationServiceClient.updateStatus(req.arn(), "APPOINTMENT_BOOKED", null,
                "Appointment booked at " + center.getName() + " on " + req.appointmentDate());

        return AppointmentResponse.from(appointment, "Appointment confirmed. Carry your ARN printout and documents per the checklist.");
    }

    @Transactional
    public AppointmentResponse reschedule(AuthenticatedUser principal, Long id, RescheduleRequest req) {
        Appointment appointment = findOwned(id, principal);
        assertActive(appointment);

        if (appointment.getRescheduleCount() >= rescheduleMaxCount) {
            throw new ApiException(HttpStatus.CONFLICT, "Maximum of " + rescheduleMaxCount + " reschedules already used (KB-PASS-004 Sec 2.3)");
        }
        int workingDaysToAppointment = WorkingDays.between(LocalDate.now(), appointment.getAppointmentDate());
        if (workingDaysToAppointment < rescheduleCutoffWorkingDays) {
            throw new ApiException(HttpStatus.CONFLICT, "Reschedule must be done at least " + rescheduleCutoffWorkingDays + " working days before the appointment date");
        }

        ensureCapacityAvailable(appointment.getCenter(), req.newAppointmentDate(), appointment.getCategory());

        appointment.setAppointmentDate(req.newAppointmentDate());
        appointment.setAppointmentTime(req.newAppointmentTime());
        appointment.setRescheduleCount(appointment.getRescheduleCount() + 1);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        appointment = appointmentRepository.save(appointment);

        String note = appointment.getRescheduleCount() >= 2
                ? "Rescheduled. Rs." + rescheduleSecondFee + " second-reschedule fee applies (KB-PASS-004 Sec 2.3)."
                : "Rescheduled at no additional charge (first reschedule is free).";
        return AppointmentResponse.from(appointment, note);
    }

    @Transactional
    public AppointmentResponse cancel(AuthenticatedUser principal, Long id) {
        Appointment appointment = findOwned(id, principal);
        assertActive(appointment);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledAt(java.time.Instant.now());
        appointment = appointmentRepository.save(appointment);

        // Authorization header not available here (DELETE has no user-facing downstream call needed) -
        // this call uses the shared internal key, not a forwarded user token.
        applicationServiceClient.updateStatus(appointment.getArn(), "SUBMITTED", null,
                "Appointment cancelled by applicant. Application fee is non-refundable (KB-PASS-004 Sec 2.3); please book a new appointment.");

        return AppointmentResponse.from(appointment, "Cancelled. The application fee already paid is non-refundable.");
    }

    @Transactional
    public AppointmentResponse markCompleted(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);

        applicationServiceClient.updateStatus(appointment.getArn(), "PSK_VISIT_COMPLETED", null,
                "PSK counter visit completed on " + LocalDate.now());
        return AppointmentResponse.from(appointment);
    }

    @Transactional
    public AppointmentResponse markNoShow(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
        appointment.setStatus(AppointmentStatus.NO_SHOW);
        appointment.setNoShowAt(java.time.Instant.now());
        appointment = appointmentRepository.save(appointment);

        applicationServiceClient.updateStatus(appointment.getArn(), "CANCELLED", null,
                "No-show at PSK appointment; fee forfeited per KB-PASS-004 Sec 2.4. Applicant must re-apply.");
        return AppointmentResponse.from(appointment);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(AuthenticatedUser principal, Long id) {
        return AppointmentResponse.from(findOwned(id, principal));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listMine(AuthenticatedUser principal) {
        return appointmentRepository.findByApplicantUserIdOrderByCreatedAtDesc(principal.userId())
                .stream().map(AppointmentResponse::from).toList();
    }

    private void ensureCapacityAvailable(PskCenter center, LocalDate date, ServiceScheme category) {
        int capacity = capacityFor(center, category);
        long booked = appointmentRepository.countByCenterIdAndAppointmentDateAndCategoryAndStatusIn(center.getId(), date, category, ACTIVE_STATUSES);
        if (booked >= capacity) {
            throw new ApiException(HttpStatus.CONFLICT, "No " + category + " slots available at " + center.getName() + " on " + date);
        }
    }

    private int capacityFor(PskCenter center, ServiceScheme category) {
        BigDecimal daily = BigDecimal.valueOf(center.getDailyCapacity());
        if (category == ServiceScheme.TATKAL) {
            return daily.multiply(BigDecimal.valueOf(center.getTatkalCapacityPercent())).divide(BigDecimal.valueOf(100)).intValue();
        }
        int tatkalShare = daily.multiply(BigDecimal.valueOf(center.getTatkalCapacityPercent())).divide(BigDecimal.valueOf(100)).intValue();
        return center.getDailyCapacity() - tatkalShare;
    }

    private Appointment findOwned(Long id, AuthenticatedUser principal) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
        boolean isOfficialOrAdmin = principal.role().equals("PSK_OFFICIAL") || principal.role().equals("RPO_OFFICIAL") || principal.role().equals("ADMIN");
        if (!isOfficialOrAdmin && !appointment.getApplicantUserId().equals(principal.userId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this appointment");
        }
        return appointment;
    }

    private void assertActive(Appointment appointment) {
        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            throw new ApiException(HttpStatus.CONFLICT, "This appointment is " + appointment.getStatus() + " and can no longer be modified");
        }
    }
}
