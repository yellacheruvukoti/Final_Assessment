package com.passportsahayak.application.controller;

import com.passportsahayak.application.dto.ApplicationResponse;
import com.passportsahayak.application.dto.ApplicationStatusResponse;
import com.passportsahayak.application.dto.CreateApplicationRequest;
import com.passportsahayak.application.dto.DocumentChecklistResponse;
import com.passportsahayak.application.dto.EligibilityCheckRequest;
import com.passportsahayak.application.dto.EligibilityCheckResponse;
import com.passportsahayak.application.dto.FeeEstimateResponse;
import com.passportsahayak.application.dto.InternalStatusUpdateRequest;
import com.passportsahayak.application.entity.ApplicationStatus;
import com.passportsahayak.application.entity.ApplicationType;
import com.passportsahayak.application.entity.BookletType;
import com.passportsahayak.application.entity.ServiceScheme;
import com.passportsahayak.application.security.AuthenticatedUser;
import com.passportsahayak.application.service.ApplicationService;
import com.passportsahayak.application.service.DocumentChecklistService;
import com.passportsahayak.application.service.EligibilityService;
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
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final EligibilityService eligibilityService;
    private final DocumentChecklistService documentChecklistService;
    private final ApplicationService applicationService;

    @PostMapping("/eligibility/check")
    public ResponseEntity<EligibilityCheckResponse> checkEligibility(@Valid @RequestBody EligibilityCheckRequest request) {
        return ResponseEntity.ok(eligibilityService.check(request));
    }

    @GetMapping("/document-checklist")
    public ResponseEntity<DocumentChecklistResponse> documentChecklist(@RequestParam ApplicationType applicationType,
                                                                        @RequestParam(defaultValue = "false") boolean minor) {
        return ResponseEntity.ok(documentChecklistService.getChecklist(applicationType, minor));
    }

    @GetMapping("/fee-estimate")
    public ResponseEntity<FeeEstimateResponse> feeEstimate(@RequestParam ApplicationType applicationType,
                                                             @RequestParam ServiceScheme serviceScheme,
                                                             @RequestParam(defaultValue = "STANDARD_36") BookletType bookletType,
                                                             @RequestParam(defaultValue = "false") boolean minor) {
        return ResponseEntity.ok(applicationService.estimateFee(applicationType, serviceScheme, bookletType, minor));
    }

    @PostMapping
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<ApplicationResponse> create(@AuthenticationPrincipal AuthenticatedUser principal,
                                                        @Valid @RequestBody CreateApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.create(principal, request));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ApplicationResponse>> mine(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(applicationService.listMine(principal));
    }

    @GetMapping("/{arn}")
    public ResponseEntity<ApplicationResponse> getByArn(@AuthenticationPrincipal AuthenticatedUser principal,
                                                          @PathVariable String arn) {
        return ResponseEntity.ok(applicationService.getByArn(arn, principal));
    }

    @GetMapping("/{arn}/status")
    public ResponseEntity<ApplicationStatusResponse> getStatus(@AuthenticationPrincipal AuthenticatedUser principal,
                                                                 @PathVariable String arn) {
        return ResponseEntity.ok(applicationService.getStatus(arn, principal));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<Page<ApplicationResponse>> listByStatus(@RequestParam ApplicationStatus status, Pageable pageable) {
        return ResponseEntity.ok(applicationService.listByStatus(status, pageable));
    }

    @PatchMapping("/{arn}/status")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<ApplicationResponse> updateStatus(@PathVariable String arn,
                                                              @Valid @RequestBody InternalStatusUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(arn, request));
    }
}
