package com.passportsahayak.fraud.controller;

import com.passportsahayak.fraud.dto.FileFraudReportRequest;
import com.passportsahayak.fraud.dto.FraudReportResponse;
import com.passportsahayak.fraud.dto.ReferralMatrixEntry;
import com.passportsahayak.fraud.dto.UpdateFraudReportStatusRequest;
import com.passportsahayak.fraud.entity.FraudReportStatus;
import com.passportsahayak.fraud.security.AuthenticatedUser;
import com.passportsahayak.fraud.service.FraudReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fraud")
@RequiredArgsConstructor
public class FraudReportController {

    private final FraudReportService fraudReportService;

    @PostMapping("/reports")
    public ResponseEntity<FraudReportResponse> file(@AuthenticationPrincipal AuthenticatedUser principal,
                                                       @Valid @RequestBody FileFraudReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fraudReportService.file(principal, request));
    }

    @GetMapping("/reports/mine")
    public ResponseEntity<List<FraudReportResponse>> mine(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(fraudReportService.listMine(principal));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<Page<FraudReportResponse>> listByStatus(@RequestParam FraudReportStatus status, Pageable pageable) {
        return ResponseEntity.ok(fraudReportService.listByStatus(status, pageable));
    }

    @PatchMapping("/reports/{id}/status")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<FraudReportResponse> updateStatus(@PathVariable Long id,
                                                              @Valid @RequestBody UpdateFraudReportStatusRequest request) {
        return ResponseEntity.ok(fraudReportService.updateStatus(id, request));
    }

    @GetMapping("/referral-matrix")
    public ResponseEntity<List<ReferralMatrixEntry>> referralMatrix() {
        return ResponseEntity.ok(fraudReportService.referralMatrix());
    }
}
