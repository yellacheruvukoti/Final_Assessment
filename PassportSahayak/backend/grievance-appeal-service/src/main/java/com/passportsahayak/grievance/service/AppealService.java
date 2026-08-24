package com.passportsahayak.grievance.service;

import com.passportsahayak.grievance.dto.AppealAuthorityInfo;
import com.passportsahayak.grievance.dto.AppealDecisionRequest;
import com.passportsahayak.grievance.dto.AppealResponse;
import com.passportsahayak.grievance.dto.FileAppealRequest;
import com.passportsahayak.grievance.entity.Appeal;
import com.passportsahayak.grievance.entity.AppealLevel;
import com.passportsahayak.grievance.entity.AppealStatus;
import com.passportsahayak.grievance.exception.ApiException;
import com.passportsahayak.grievance.repository.AppealRepository;
import com.passportsahayak.grievance.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * 4-level appeal authority chain per KB-PASS-005 Section 4.2.
 */
@Service
@RequiredArgsConstructor
public class AppealService {

    private final AppealRepository repository;

    @Transactional
    public AppealResponse file(AuthenticatedUser principal, FileAppealRequest req) {
        Appeal appeal = Appeal.builder()
                .arn(req.arn())
                .applicantUserId(principal.userId())
                .level(AppealLevel.LEVEL_1_DPO)
                .groundText(req.groundText())
                .status(AppealStatus.PENDING)
                .build();
        return AppealResponse.from(repository.save(appeal));
    }

    public List<AppealResponse> getByArn(String arn) {
        return repository.findByArnOrderByCreatedAtDesc(arn).stream().map(AppealResponse::from).toList();
    }

    public Page<AppealResponse> listByStatus(AppealStatus status, Pageable pageable) {
        return repository.findByStatus(status, pageable).map(AppealResponse::from);
    }

    @Transactional
    public AppealResponse decide(Long id, AppealDecisionRequest req) {
        Appeal appeal = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appeal not found"));

        appeal.setStatus(req.status());
        appeal.setDecisionNotes(req.decisionNotes());
        appeal.setDecidedAt(Instant.now());
        appeal = repository.save(appeal);

        if (req.status() == AppealStatus.ESCALATED) {
            AppealLevel next = nextLevel(appeal.getLevel());
            Appeal escalated = Appeal.builder()
                    .arn(appeal.getArn())
                    .applicantUserId(appeal.getApplicantUserId())
                    .level(next)
                    .groundText(appeal.getGroundText())
                    .status(AppealStatus.PENDING)
                    .build();
            repository.save(escalated);
        }

        return AppealResponse.from(appeal);
    }

    private AppealLevel nextLevel(AppealLevel current) {
        return switch (current) {
            case LEVEL_1_DPO -> AppealLevel.LEVEL_2_PASSPORT_OFFICER;
            case LEVEL_2_PASSPORT_OFFICER -> AppealLevel.LEVEL_3_RPO_HEAD;
            case LEVEL_3_RPO_HEAD -> AppealLevel.LEVEL_4_JOINT_SECRETARY;
            case LEVEL_4_JOINT_SECRETARY -> throw new ApiException(HttpStatus.CONFLICT,
                    "Level 4 (Joint Secretary, CPV Division) is the final appellate authority. "
                            + "Further recourse is a Writ Petition before the High Court / Supreme Court.");
        };
    }

    public List<AppealAuthorityInfo> authorityChain() {
        return List.of(
                new AppealAuthorityInfo("LEVEL_1_DPO", "Deputy Passport Officer (DPO) at RPO",
                        "Documentation issues, minor data errors, address mismatch", "Within 30 days of rejection"),
                new AppealAuthorityInfo("LEVEL_2_PASSPORT_OFFICER", "Passport Officer at RPO",
                        "Adverse PV report, PV-related rejection, re-verification", "Within 30 days of Level 1 decision"),
                new AppealAuthorityInfo("LEVEL_3_RPO_HEAD", "Regional Passport Officer (RPO Head)",
                        "PV irreversibility, policy interpretation disputes", "Within 30 days of Level 2 decision"),
                new AppealAuthorityInfo("LEVEL_4_JOINT_SECRETARY", "Joint Secretary (CPV Division), MEA",
                        "All remaining grounds; final appellate authority", "Within 60 days of Level 3 decision"),
                new AppealAuthorityInfo("LEGAL_RECOURSE", "High Court / Supreme Court (Writ Petition)",
                        "Constitutional right to travel; mandamus writ", "As per court procedures")
        );
    }
}
