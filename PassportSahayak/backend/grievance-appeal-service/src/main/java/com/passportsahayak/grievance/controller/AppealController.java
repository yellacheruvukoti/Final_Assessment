package com.passportsahayak.grievance.controller;

import com.passportsahayak.grievance.dto.AppealAuthorityInfo;
import com.passportsahayak.grievance.dto.AppealDecisionRequest;
import com.passportsahayak.grievance.dto.AppealResponse;
import com.passportsahayak.grievance.dto.FileAppealRequest;
import com.passportsahayak.grievance.entity.AppealStatus;
import com.passportsahayak.grievance.security.AuthenticatedUser;
import com.passportsahayak.grievance.service.AppealService;
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
@RequestMapping("/appeals")
@RequiredArgsConstructor
public class AppealController {

    private final AppealService appealService;

    @PostMapping
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<AppealResponse> file(@AuthenticationPrincipal AuthenticatedUser principal,
                                                 @Valid @RequestBody FileAppealRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appealService.file(principal, request));
    }

    @GetMapping("/{arn}")
    public ResponseEntity<List<AppealResponse>> byArn(@PathVariable String arn) {
        return ResponseEntity.ok(appealService.getByArn(arn));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<Page<AppealResponse>> listByStatus(@RequestParam AppealStatus status, Pageable pageable) {
        return ResponseEntity.ok(appealService.listByStatus(status, pageable));
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<AppealResponse> decide(@PathVariable Long id, @Valid @RequestBody AppealDecisionRequest request) {
        return ResponseEntity.ok(appealService.decide(id, request));
    }

    @GetMapping("/authority-chain")
    public ResponseEntity<List<AppealAuthorityInfo>> authorityChain() {
        return ResponseEntity.ok(appealService.authorityChain());
    }
}
