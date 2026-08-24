package com.passportsahayak.fraud.service;

import com.passportsahayak.fraud.dto.FileFraudReportRequest;
import com.passportsahayak.fraud.dto.FraudReportResponse;
import com.passportsahayak.fraud.dto.ReferralMatrixEntry;
import com.passportsahayak.fraud.dto.UpdateFraudReportStatusRequest;
import com.passportsahayak.fraud.entity.FraudCategory;
import com.passportsahayak.fraud.entity.FraudReport;
import com.passportsahayak.fraud.entity.FraudReportStatus;
import com.passportsahayak.fraud.exception.ApiException;
import com.passportsahayak.fraud.repository.FraudReportRepository;
import com.passportsahayak.fraud.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Fraud categories, severities and CVC/ACB referral routing per KB-PASS-007 Sections 2.1 & 2.4.
 */
@Service
@RequiredArgsConstructor
public class FraudReportService {

    private record Rule(String severity, String referralAuthority, String outcome) {
    }

    private static final Map<FraudCategory, Rule> RULES = Map.of(
            FraudCategory.DOCUMENT_FORGERY, new Rule("CRITICAL", "PSK Manager -> RPO -> Police", "Application cancelled; FIR filed; blacklisted in MEA system"),
            FraudCategory.IDENTITY_IMPERSONATION, new Rule("CRITICAL", "PSK Staff -> PSK Manager -> Police", "Application cancelled; security footage preserved; FIR filed"),
            FraudCategory.SUPPRESSION_OF_INFO, new Rule("HIGH", "RPO Review", "Application referred for review; may lead to rejection/prosecution"),
            FraudCategory.AGENT_BROKER_FRAUD, new Rule("HIGH", "PGPortal.gov.in + PSK helpline", "CVC / ACB referral; agent blacklisted from PSK premises"),
            FraudCategory.DUPLICATE_PASSPORT, new Rule("CRITICAL", "RPO -> MEA Intelligence Division", "Both passports impounded; criminal proceedings initiated"),
            FraudCategory.ONLINE_PHISHING, new Rule("HIGH", "CERT-In (cert-in.org.in) + cyber police", "Fraudulent site reported; applicant alerted via MEA advisory"),
            FraudCategory.INTERNAL_MISCONDUCT, new Rule("CRITICAL", "Central Vigilance Commission (CVC) + State ACB", "Investigation; prosecution under Prevention of Corruption Act 1988"),
            FraudCategory.PV_CORRUPTION, new Rule("CRITICAL", "State Anti-Corruption Bureau (ACB)", "FIR; departmental inquiry; suspension")
    );

    private final FraudReportRepository repository;

    @Transactional
    public FraudReportResponse file(AuthenticatedUser principal, FileFraudReportRequest req) {
        Rule rule = RULES.get(req.category());
        FraudReport report = FraudReport.builder()
                .reportedByUserId(principal.userId())
                .arn(req.arn())
                .category(req.category())
                .severity(rule.severity())
                .referralAuthority(rule.referralAuthority())
                .description(req.description())
                .status(FraudReportStatus.REPORTED)
                .build();
        return FraudReportResponse.from(repository.save(report));
    }

    public List<FraudReportResponse> listMine(AuthenticatedUser principal) {
        return repository.findByReportedByUserIdOrderByCreatedAtDesc(principal.userId())
                .stream().map(FraudReportResponse::from).toList();
    }

    public Page<FraudReportResponse> listByStatus(FraudReportStatus status, Pageable pageable) {
        return repository.findByStatus(status, pageable).map(FraudReportResponse::from);
    }

    @Transactional
    public FraudReportResponse updateStatus(Long id, UpdateFraudReportStatusRequest req) {
        FraudReport report = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fraud report not found"));
        report.setStatus(req.status());
        return FraudReportResponse.from(repository.save(report));
    }

    public List<ReferralMatrixEntry> referralMatrix() {
        return RULES.entrySet().stream()
                .map(e -> new ReferralMatrixEntry(e.getKey().name(), e.getValue().severity(), e.getValue().referralAuthority(), e.getValue().outcome()))
                .toList();
    }
}
