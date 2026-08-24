package com.passportsahayak.application.util;

import com.passportsahayak.application.entity.ApplicationStatus;

import java.util.Map;

/**
 * "Applicant Next Step" text per KB-PASS-005 Section 2.1 status table.
 */
public final class StatusGuidance {

    private static final Map<ApplicationStatus, String> NEXT_STEP = Map.ofEntries(
            Map.entry(ApplicationStatus.SUBMITTED, "Book your PSK/POPSK appointment."),
            Map.entry(ApplicationStatus.APPOINTMENT_BOOKED, "Prepare documents per the checklist and visit the PSK on your appointment date."),
            Map.entry(ApplicationStatus.PSK_VISIT_COMPLETED, "Wait for police verification (PV) dispatch confirmation."),
            Map.entry(ApplicationStatus.PV_DISPATCHED, "Ensure availability at your registered address for the police home visit."),
            Map.entry(ApplicationStatus.PV_IN_PROGRESS, "No action required; the PV report is being compiled."),
            Map.entry(ApplicationStatus.PV_CLEARED, "Your passport is being printed and dispatched."),
            Map.entry(ApplicationStatus.PASSPORT_DISPATCHED, "Track delivery via the Speed Post tracking number."),
            Map.entry(ApplicationStatus.PASSPORT_DELIVERED, "Collect from the post office if delivery was missed."),
            Map.entry(ApplicationStatus.ON_HOLD, "Contact your RPO or PSK immediately; you have a 30-day window to resolve the issue."),
            Map.entry(ApplicationStatus.REJECTED, "You may file an appeal within 30 days (see the Grievance & Appeal service)."),
            Map.entry(ApplicationStatus.CANCELLED, "This application has been cancelled. You may submit a fresh application.")
    );

    private StatusGuidance() {
    }

    public static String forStatus(ApplicationStatus status) {
        return NEXT_STEP.getOrDefault(status, "No action required.");
    }
}
