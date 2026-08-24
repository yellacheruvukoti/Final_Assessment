package com.passportsahayak.appointment.controller;

import com.passportsahayak.appointment.dto.AppointmentResponse;
import com.passportsahayak.appointment.dto.BookAppointmentRequest;
import com.passportsahayak.appointment.dto.CapacityResponse;
import com.passportsahayak.appointment.dto.RescheduleRequest;
import com.passportsahayak.appointment.dto.SlotSearchResponse;
import com.passportsahayak.appointment.entity.ServiceScheme;
import com.passportsahayak.appointment.security.AuthenticatedUser;
import com.passportsahayak.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/slots")
    public ResponseEntity<List<SlotSearchResponse>> slots(@RequestParam(required = false) Long centerId,
                                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                            @RequestParam ServiceScheme category) {
        return ResponseEntity.ok(appointmentService.searchSlots(centerId, date, category));
    }

    @GetMapping("/capacity")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<CapacityResponse> capacity(@RequestParam Long centerId,
                                                       @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.capacity(centerId, date));
    }

    @PostMapping("/fresh/book")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<AppointmentResponse> bookFresh(@AuthenticationPrincipal AuthenticatedUser principal,
                                                           @RequestHeader("Authorization") String authorization,
                                                           @Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.bookFresh(principal, request, authorization));
    }

    @PostMapping("/renewal/book")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<AppointmentResponse> bookRenewal(@AuthenticationPrincipal AuthenticatedUser principal,
                                                             @RequestHeader("Authorization") String authorization,
                                                             @Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.bookRenewal(principal, request, authorization));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponse> reschedule(@AuthenticationPrincipal AuthenticatedUser principal,
                                                            @PathVariable Long id,
                                                            @Valid @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(appointmentService.reschedule(principal, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AppointmentResponse> cancel(@AuthenticationPrincipal AuthenticatedUser principal,
                                                        @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancel(principal, id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getById(@AuthenticationPrincipal AuthenticatedUser principal,
                                                         @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getById(principal, id));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<AppointmentResponse>> mine(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(appointmentService.listMine(principal));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<AppointmentResponse> complete(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.markCompleted(id));
    }

    @PostMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<AppointmentResponse> noShow(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.markNoShow(id));
    }
}
