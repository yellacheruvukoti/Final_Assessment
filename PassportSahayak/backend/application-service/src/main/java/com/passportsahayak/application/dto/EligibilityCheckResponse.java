package com.passportsahayak.application.dto;

import com.passportsahayak.application.entity.ApplicationType;
import com.passportsahayak.application.entity.BookletType;
import com.passportsahayak.application.entity.PvType;

import java.util.List;

public record EligibilityCheckResponse(
        boolean minor,
        List<ApplicationType> eligibleApplicationTypes,
        ApplicationType recommendedApplicationType,
        int validityYears,
        List<BookletType> allowedBookletTypes,
        boolean tatkalEligible,
        String tatkalNote,
        PvType recommendedPvType,
        String ecrEcnrGuidance,
        String notes
) {
}
