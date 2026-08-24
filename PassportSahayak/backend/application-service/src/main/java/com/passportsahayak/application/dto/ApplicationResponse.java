package com.passportsahayak.application.dto;

import com.passportsahayak.application.entity.ApplicationStatus;
import com.passportsahayak.application.entity.ApplicationType;
import com.passportsahayak.application.entity.BookletType;
import com.passportsahayak.application.entity.PassportApplication;
import com.passportsahayak.application.entity.PvType;
import com.passportsahayak.application.entity.ServiceScheme;

import java.math.BigDecimal;
import java.time.Instant;

public record ApplicationResponse(
        Long id,
        String arn,
        Long applicantUserId,
        ApplicationType applicationType,
        ServiceScheme serviceScheme,
        BookletType bookletType,
        boolean minor,
        ApplicationStatus status,
        PvType pvType,
        BigDecimal feeAmount,
        boolean feePaid,
        String remarks,
        Instant createdAt,
        Instant updatedAt
) {
    public static ApplicationResponse from(PassportApplication app) {
        return new ApplicationResponse(
                app.getId(), app.getArn(), app.getApplicantUserId(), app.getApplicationType(), app.getServiceScheme(),
                app.getBookletType(), app.isMinor(), app.getStatus(), app.getPvType(),
                app.getFeeAmount(), app.isFeePaid(), app.getRemarks(), app.getCreatedAt(), app.getUpdatedAt()
        );
    }
}
