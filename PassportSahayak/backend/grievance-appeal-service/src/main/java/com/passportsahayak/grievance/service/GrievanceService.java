package com.passportsahayak.grievance.service;

import com.passportsahayak.grievance.dto.FileGrievanceRequest;
import com.passportsahayak.grievance.dto.GrievanceResponse;
import com.passportsahayak.grievance.dto.SlaMatrixEntry;
import com.passportsahayak.grievance.dto.UpdateGrievanceStatusRequest;
import com.passportsahayak.grievance.entity.Grievance;
import com.passportsahayak.grievance.entity.GrievanceStatus;
import com.passportsahayak.grievance.entity.GrievanceType;
import com.passportsahayak.grievance.exception.ApiException;
import com.passportsahayak.grievance.repository.GrievanceRepository;
import com.passportsahayak.grievance.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * SLA matrix per KB-PASS-005 Section 3.1.
 */
@Service
@RequiredArgsConstructor
public class GrievanceService {

    private static final Map<GrievanceType, Integer> SLA_DAYS = Map.of(
            GrievanceType.STATUS_DELAY, 7,
            GrievanceType.PV_DELAY, 5,
            GrievanceType.INCORRECT_REJECTION, 10,
            GrievanceType.PASSPORT_NOT_RECEIVED, 7,
            GrievanceType.STAFF_MISCONDUCT, 15,
            GrievanceType.POLICE_PAYMENT_DEMAND, 3,
            GrievanceType.DATA_ENTRY_ERROR, 7
    );

    private final GrievanceRepository repository;

    @Transactional
    public GrievanceResponse file(AuthenticatedUser principal, FileGrievanceRequest req) {
        Grievance grievance = Grievance.builder()
                .complainantUserId(principal.userId())
                .arn(req.arn())
                .type(req.type())
                .description(req.description())
                .status(GrievanceStatus.OPEN)
                .slaWorkingDays(SLA_DAYS.getOrDefault(req.type(), 7))
                .build();
        return GrievanceResponse.from(repository.save(grievance));
    }

    public List<GrievanceResponse> listMine(AuthenticatedUser principal) {
        return repository.findByComplainantUserIdOrderByCreatedAtDesc(principal.userId())
                .stream().map(GrievanceResponse::from).toList();
    }

    public Page<GrievanceResponse> listByStatus(GrievanceStatus status, Pageable pageable) {
        return repository.findByStatus(status, pageable).map(GrievanceResponse::from);
    }

    @Transactional
    public GrievanceResponse updateStatus(Long id, UpdateGrievanceStatusRequest req) {
        Grievance grievance = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Grievance not found"));
        grievance.setStatus(req.status());
        if (req.resolutionNotes() != null) {
            grievance.setResolutionNotes(req.resolutionNotes());
        }
        if (req.status() == GrievanceStatus.RESOLVED) {
            grievance.setResolvedAt(Instant.now());
        }
        return GrievanceResponse.from(repository.save(grievance));
    }

    public List<SlaMatrixEntry> slaMatrix() {
        return List.of(
                new SlaMatrixEntry("STATUS_DELAY", "Passport Seva Portal Grievance", 7, "RPO Grievance Cell -> Joint Secretary CPV"),
                new SlaMatrixEntry("PV_DELAY", "Portal Grievance / PSK Helpline 1800-258-1800", 5, "RPO -> SP Office follow-up via CCTNS"),
                new SlaMatrixEntry("INCORRECT_REJECTION", "PSK Manager -> RPO Grievance Cell", 10, "RPO Deputy Passport Officer (DPO)"),
                new SlaMatrixEntry("PASSPORT_NOT_RECEIVED", "Speed Post tracking -> India Post complaint -> RPO", 7, "RPO re-dispatch order"),
                new SlaMatrixEntry("STAFF_MISCONDUCT", "PSK Feedback form + PGPortal.gov.in", 15, "CVC / ACB referral"),
                new SlaMatrixEntry("POLICE_PAYMENT_DEMAND", "PSK helpline 1800-258-1800 + PGPortal", 3, "CVC / State ACB referral"),
                new SlaMatrixEntry("DATA_ENTRY_ERROR", "RPO Data Correction Counter", 7, "RPO Senior Officer review")
        );
    }
}
