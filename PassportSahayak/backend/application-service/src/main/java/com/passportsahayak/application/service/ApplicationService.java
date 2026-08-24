package com.passportsahayak.application.service;

import com.passportsahayak.application.dto.ApplicationResponse;
import com.passportsahayak.application.dto.ApplicationStatusResponse;
import com.passportsahayak.application.dto.CreateApplicationRequest;
import com.passportsahayak.application.dto.FeeEstimateResponse;
import com.passportsahayak.application.dto.InternalStatusUpdateRequest;
import com.passportsahayak.application.entity.ApplicationStatus;
import com.passportsahayak.application.entity.BookletType;
import com.passportsahayak.application.entity.PassportApplication;
import com.passportsahayak.application.exception.ApiException;
import com.passportsahayak.application.repository.PassportApplicationRepository;
import com.passportsahayak.application.security.AuthenticatedUser;
import com.passportsahayak.application.util.ArnGenerator;
import com.passportsahayak.application.util.FeeCalculator;
import com.passportsahayak.application.util.StatusGuidance;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final PassportApplicationRepository repository;
    private final ArnGenerator arnGenerator;
    private final FeeCalculator feeCalculator;

    @Transactional
    public ApplicationResponse create(AuthenticatedUser principal, CreateApplicationRequest req) {
        boolean minor = Period.between(req.dateOfBirth(), LocalDate.now()).getYears() < 18;
        BookletType bookletType = minor ? BookletType.STANDARD_36 : req.bookletType();

        if (req.serviceScheme().name().equals("TATKAL") && req.tatkalReason() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A Tatkal reason is required for Tatkal applications");
        }

        PassportApplication app = PassportApplication.builder()
                .arn(arnGenerator.generate())
                .applicantUserId(principal.userId())
                .applicantFullName(principal.fullName())
                .applicantEmail(principal.email())
                .applicantPhone(principal.phone())
                .dateOfBirth(req.dateOfBirth())
                .minor(minor)
                .applicationType(req.applicationType())
                .serviceScheme(req.serviceScheme())
                .bookletType(bookletType)
                .status(ApplicationStatus.SUBMITTED)
                .tatkalReason(req.tatkalReason())
                .feeAmount(feeCalculator.calculate(req.applicationType(), req.serviceScheme(), bookletType, minor))
                .feePaid(true)
                .build();

        app = repository.save(app);
        return ApplicationResponse.from(app);
    }

    public FeeEstimateResponse estimateFee(com.passportsahayak.application.entity.ApplicationType type,
                                            com.passportsahayak.application.entity.ServiceScheme scheme,
                                            BookletType bookletType, boolean minor) {
        var amount = feeCalculator.calculate(type, scheme, minor ? BookletType.STANDARD_36 : bookletType, minor);
        String breakdown = minor
                ? "Minor fee schedule (KB-PASS-001 Sec 4.2): " + (scheme.name().equals("TATKAL") ? "Rs.3000 (incl. Rs.2000 Tatkal surcharge)" : "Rs.1000")
                : "Standard fee schedule (KB-PASS-001 Sec 4.2) for " + type + " / " + scheme + " / " + bookletType;
        return new FeeEstimateResponse(amount, breakdown);
    }

    public ApplicationResponse getByArn(String arn, AuthenticatedUser principal) {
        PassportApplication app = findOrThrow(arn);
        assertOwnerOrOfficial(app, principal);
        return ApplicationResponse.from(app);
    }

    public ApplicationStatusResponse getStatus(String arn, AuthenticatedUser principal) {
        PassportApplication app = findOrThrow(arn);
        assertOwnerOrOfficial(app, principal);
        return new ApplicationStatusResponse(app.getArn(), app.getStatus(), app.getPvType(),
                StatusGuidance.forStatus(app.getStatus()), app.getUpdatedAt());
    }

    public List<ApplicationResponse> listMine(AuthenticatedUser principal) {
        return repository.findByApplicantUserIdOrderByCreatedAtDesc(principal.userId())
                .stream().map(ApplicationResponse::from).toList();
    }

    public Page<ApplicationResponse> listByStatus(ApplicationStatus status, Pageable pageable) {
        return repository.findByStatus(status, pageable).map(ApplicationResponse::from);
    }

    @Transactional
    public ApplicationResponse updateStatus(String arn, InternalStatusUpdateRequest req) {
        PassportApplication app = findOrThrow(arn);
        app.setStatus(req.status());
        if (req.pvType() != null) {
            app.setPvType(req.pvType());
        }
        if (req.remarks() != null) {
            app.setRemarks(req.remarks());
        }
        app = repository.save(app);
        return ApplicationResponse.from(app);
    }

    private PassportApplication findOrThrow(String arn) {
        return repository.findByArn(arn)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No application found for ARN " + arn));
    }

    private void assertOwnerOrOfficial(PassportApplication app, AuthenticatedUser principal) {
        boolean isOfficialOrAdmin = principal.role().equals("PSK_OFFICIAL")
                || principal.role().equals("RPO_OFFICIAL")
                || principal.role().equals("ADMIN");
        if (!isOfficialOrAdmin && !app.getApplicantUserId().equals(principal.userId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this application");
        }
    }
}
