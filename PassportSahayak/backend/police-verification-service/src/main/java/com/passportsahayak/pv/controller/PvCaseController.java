package com.passportsahayak.pv.controller;

import com.passportsahayak.pv.dto.ClassificationRule;
import com.passportsahayak.pv.dto.DispatchPvCaseRequest;
import com.passportsahayak.pv.dto.PvCaseResponse;
import com.passportsahayak.pv.dto.UpdatePvCaseStatusRequest;
import com.passportsahayak.pv.entity.PvCaseStatus;
import com.passportsahayak.pv.security.AuthenticatedUser;
import com.passportsahayak.pv.service.PoliceVerificationService;
import com.passportsahayak.pv.service.PvClassificationService;
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
@RequestMapping("/pv")
@RequiredArgsConstructor
public class PvCaseController {

    private final PoliceVerificationService policeVerificationService;
    private final PvClassificationService classificationService;

    @GetMapping("/classification-rules")
    public ResponseEntity<List<ClassificationRule>> classificationRules() {
        return ResponseEntity.ok(classificationService.referenceTable());
    }

    @PostMapping("/cases")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<PvCaseResponse> dispatch(@RequestHeader("Authorization") String authorization,
                                                     @Valid @RequestBody DispatchPvCaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policeVerificationService.dispatch(request, authorization));
    }

    @GetMapping("/cases/{arn}")
    public ResponseEntity<PvCaseResponse> getByArn(@AuthenticationPrincipal AuthenticatedUser principal,
                                                     @PathVariable String arn) {
        return ResponseEntity.ok(policeVerificationService.getByArn(arn, principal));
    }

    @GetMapping("/cases")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<Page<PvCaseResponse>> listByStatus(@RequestParam PvCaseStatus status, Pageable pageable) {
        return ResponseEntity.ok(policeVerificationService.listByStatus(status, pageable));
    }

    @PatchMapping("/cases/{arn}/status")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<PvCaseResponse> updateStatus(@PathVariable String arn,
                                                         @Valid @RequestBody UpdatePvCaseStatusRequest request) {
        return ResponseEntity.ok(policeVerificationService.updateStatus(arn, request));
    }

    @PostMapping("/sla-breaches/refresh")
    @PreAuthorize("hasAnyRole('RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<List<PvCaseResponse>> refreshSlaBreaches() {
        return ResponseEntity.ok(policeVerificationService.flagSlaBreaches());
    }
}
