package com.passportsahayak.application.service;

import com.passportsahayak.application.dto.EligibilityCheckRequest;
import com.passportsahayak.application.dto.EligibilityCheckResponse;
import com.passportsahayak.application.dto.ExistingPassportStatus;
import com.passportsahayak.application.entity.ApplicationType;
import com.passportsahayak.application.entity.BookletType;
import com.passportsahayak.application.entity.PvType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

/**
 * Deterministic, rule-based eligibility engine derived from KB-PASS-001
 * (Passport Types, Categories & Eligibility). No AI/LLM involved.
 */
@Service
public class EligibilityService {

    public EligibilityCheckResponse check(EligibilityCheckRequest req) {
        int age = Period.between(req.dateOfBirth(), LocalDate.now()).getYears();
        boolean minor = age < 18;

        List<ApplicationType> eligible = new ArrayList<>();
        ApplicationType recommended;
        PvType pvType;

        ExistingPassportStatus existing = req.existingPassportStatus();

        if (existing == ExistingPassportStatus.LOST || existing == ExistingPassportStatus.DAMAGED) {
            eligible.add(ApplicationType.REISSUE_LOST_DAMAGED);
            recommended = ApplicationType.REISSUE_LOST_DAMAGED;
            pvType = PvType.PRE_PV; // KB-PASS-003 2.1: lost passport re-issue is always Pre-PV
        } else if (existing == ExistingPassportStatus.NONE) {
            eligible.add(ApplicationType.FRESH);
            recommended = ApplicationType.FRESH;
            pvType = minor ? PvType.POST_PV : PvType.PRE_PV;
        } else if (existing == ExistingPassportStatus.EXPIRED) {
            boolean expiredWithin3Years = req.existingPassportExpiryDate() != null
                    && Period.between(req.existingPassportExpiryDate(), LocalDate.now()).getYears() < 3;
            if (expiredWithin3Years) {
                eligible.add(ApplicationType.REISSUE_RENEWAL);
                recommended = ApplicationType.REISSUE_RENEWAL;
            } else {
                eligible.add(ApplicationType.FRESH);
                recommended = ApplicationType.FRESH;
            }
            pvType = req.addressChangedSinceLastPassport() ? PvType.PRE_PV : PvType.POST_PV;
        } else { // VALID
            eligible.add(ApplicationType.REISSUE_RENEWAL);
            eligible.add(ApplicationType.REISSUE_NAME_CHANGE);
            recommended = req.pagesExhausted() ? ApplicationType.REISSUE_RENEWAL : ApplicationType.REISSUE_NAME_CHANGE;
            pvType = req.addressChangedSinceLastPassport() ? PvType.PRE_PV : PvType.POST_PV;
        }

        boolean tatkalEligible = req.tatkalReason() != null
                && (req.travelWithinDays() == null || req.travelWithinDays() <= 30 || isAlwaysEligibleReason(req));
        String tatkalNote = tatkalEligible
                ? "Tatkal eligible under scheme reason '" + req.tatkalReason() + "'. Supporting documentation is mandatory at the PSK counter (KB-PASS-001 Sec 5.1)."
                : "Not eligible for Tatkal: provide a qualifying urgency reason with travel/deadline within 30 days.";

        int validityYears = minor ? 5 : 10;
        List<BookletType> allowedBooklets = minor
                ? List.of(BookletType.STANDARD_36)
                : List.of(BookletType.STANDARD_36, BookletType.JUMBO_60);

        String ecrEcnrGuidance = "ECR applies to holders below matriculation (10th standard) travelling for employment to "
                + "ECR-designated countries. ECNR is granted to matriculates and above, government employees, ITR filers "
                + "(3+ years) and professional certificate holders (KB-PASS-001 Sec 6).";

        String notes = minor
                ? "Minor application: both parents' consent required, or Annexure C/D/H as applicable (KB-PASS-002 Sec 3.2)."
                : "Adult application. See document checklist for the recommended application type.";

        return new EligibilityCheckResponse(minor, eligible, recommended, validityYears, allowedBooklets,
                tatkalEligible, tatkalNote, pvType, ecrEcnrGuidance, notes);
    }

    private boolean isAlwaysEligibleReason(EligibilityCheckRequest req) {
        return switch (req.tatkalReason()) {
            case MEDICAL_EMERGENCY, DEATH_OF_RELATIVE_ABROAD, COURT_LEGAL_SUMMONS -> true;
            default -> false;
        };
    }
}
