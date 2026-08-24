package com.passportsahayak.pv.service;

import com.passportsahayak.pv.client.ApplicationServiceClient;
import com.passportsahayak.pv.client.ApplicationView;
import com.passportsahayak.pv.dto.DispatchPvCaseRequest;
import com.passportsahayak.pv.dto.PvCaseResponse;
import com.passportsahayak.pv.dto.UpdatePvCaseStatusRequest;
import com.passportsahayak.pv.entity.PoliceVerificationCase;
import com.passportsahayak.pv.entity.PvCaseStatus;
import com.passportsahayak.pv.entity.PvType;
import com.passportsahayak.pv.exception.ApiException;
import com.passportsahayak.pv.repository.PoliceVerificationCaseRepository;
import com.passportsahayak.pv.security.AuthenticatedUser;
import com.passportsahayak.pv.util.WorkingDays;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PoliceVerificationService {

    private static final Map<PvCaseStatus, String> APPLICANT_ACTION = Map.of(
            PvCaseStatus.DISPATCHED, "No action required; wait for home visit assignment.",
            PvCaseStatus.ASSIGNED, "Be available at your registered address.",
            PvCaseStatus.IN_PROGRESS, "Ensure all documents are accessible for the home visit.",
            PvCaseStatus.REPORT_RECEIVED, "No action required; passport being processed.",
            PvCaseStatus.ADVERSE, "Contact your RPO immediately; a Show Cause Notice has been issued.",
            PvCaseStatus.CLEARED, "Expect Speed Post delivery within 5-7 working days.",
            PvCaseStatus.OVERDUE, "File a grievance via the Grievance & Appeal service or call 1800-258-1800."
    );

    private final PoliceVerificationCaseRepository repository;
    private final ApplicationServiceClient applicationServiceClient;
    private final PvClassificationService classificationService;

    @Transactional
    public PvCaseResponse dispatch(DispatchPvCaseRequest req, String authorizationHeader) {
        if (repository.existsByArn(req.arn())) {
            throw new ApiException(HttpStatus.CONFLICT, "A PV case already exists for ARN " + req.arn());
        }
        ApplicationView application = applicationServiceClient.getByArn(req.arn(), authorizationHeader);

        PvType pvType = classificationService.classify(req, application.applicationType(), application.minor());
        int slaDays = classificationService.slaWorkingDays(pvType);
        LocalDate slaDeadline = WorkingDays.plusWorkingDays(LocalDate.now(), slaDays);

        PoliceVerificationCase pvCase = PoliceVerificationCase.builder()
                .arn(req.arn())
                .applicantUserId(application.applicantUserId())
                .pvType(pvType)
                .status(pvType == PvType.PV_EXEMPT ? PvCaseStatus.CLEARED : PvCaseStatus.DISPATCHED)
                .district(req.district())
                .state(req.state())
                .dispatchedAt(Instant.now())
                .slaDeadline(slaDeadline)
                .remarks(pvType == PvType.PV_EXEMPT ? "PV-exempt category; dispatched without physical verification" : null)
                .build();
        if (pvCase.getStatus() == PvCaseStatus.CLEARED) {
            pvCase.setClearedAt(Instant.now());
        }
        pvCase = repository.save(pvCase);

        String appStatus = pvType == PvType.PV_EXEMPT ? "PV_CLEARED" : "PV_DISPATCHED";
        applicationServiceClient.updateStatus(req.arn(), appStatus, pvType.name(),
                "PV case " + pvCase.getStatus() + " (" + pvType + "), SLA deadline " + slaDeadline);

        return PvCaseResponse.from(pvCase, APPLICANT_ACTION.get(pvCase.getStatus()));
    }

    public PvCaseResponse getByArn(String arn, AuthenticatedUser principal) {
        PoliceVerificationCase pvCase = findOrThrow(arn);
        assertOwnerOrOfficial(pvCase, principal);
        return PvCaseResponse.from(pvCase, APPLICANT_ACTION.get(pvCase.getStatus()));
    }

    public Page<PvCaseResponse> listByStatus(PvCaseStatus status, Pageable pageable) {
        return repository.findByStatus(status, pageable)
                .map(c -> PvCaseResponse.from(c, APPLICANT_ACTION.get(c.getStatus())));
    }

    @Transactional
    public PvCaseResponse updateStatus(String arn, UpdatePvCaseStatusRequest req) {
        PoliceVerificationCase pvCase = findOrThrow(arn);
        pvCase.setStatus(req.status());
        if (req.remarks() != null) {
            pvCase.setRemarks(req.remarks());
        }

        String appStatus;
        switch (req.status()) {
            case CLEARED -> {
                pvCase.setClearedAt(Instant.now());
                appStatus = "PV_CLEARED";
            }
            case ADVERSE -> appStatus = "ON_HOLD";
            default -> appStatus = "PV_IN_PROGRESS";
        }
        pvCase = repository.save(pvCase);

        applicationServiceClient.updateStatus(arn, appStatus, pvCase.getPvType().name(),
                req.remarks() != null ? req.remarks() : "PV case status updated to " + req.status());

        return PvCaseResponse.from(pvCase, APPLICANT_ACTION.get(pvCase.getStatus()));
    }

    @Transactional
    public List<PvCaseResponse> flagSlaBreaches() {
        List<PoliceVerificationCase> overdue = repository.findBySlaDeadlineBeforeAndStatusNotInAndStatusNot(
                LocalDate.now(), List.of(PvCaseStatus.CLEARED, PvCaseStatus.ADVERSE), PvCaseStatus.OVERDUE);
        overdue.forEach(c -> c.setStatus(PvCaseStatus.OVERDUE));
        repository.saveAll(overdue);
        return overdue.stream().map(c -> PvCaseResponse.from(c, APPLICANT_ACTION.get(c.getStatus()))).toList();
    }

    private PoliceVerificationCase findOrThrow(String arn) {
        return repository.findByArn(arn)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No PV case found for ARN " + arn));
    }

    private void assertOwnerOrOfficial(PoliceVerificationCase pvCase, AuthenticatedUser principal) {
        boolean isOfficialOrAdmin = principal.role().equals("PSK_OFFICIAL") || principal.role().equals("RPO_OFFICIAL") || principal.role().equals("ADMIN");
        if (!isOfficialOrAdmin && !pvCase.getApplicantUserId().equals(principal.userId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this PV case");
        }
    }
}
