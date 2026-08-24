package com.passportsahayak.grievance.controller;

import com.passportsahayak.grievance.dto.FileGrievanceRequest;
import com.passportsahayak.grievance.dto.GrievanceResponse;
import com.passportsahayak.grievance.dto.SlaMatrixEntry;
import com.passportsahayak.grievance.dto.UpdateGrievanceStatusRequest;
import com.passportsahayak.grievance.entity.GrievanceStatus;
import com.passportsahayak.grievance.security.AuthenticatedUser;
import com.passportsahayak.grievance.service.GrievanceService;
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
@RequestMapping("/grievances")
@RequiredArgsConstructor
public class GrievanceController {

    private final GrievanceService grievanceService;

    @PostMapping
    public ResponseEntity<GrievanceResponse> file(@AuthenticationPrincipal AuthenticatedUser principal,
                                                    @Valid @RequestBody FileGrievanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(grievanceService.file(principal, request));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<GrievanceResponse>> mine(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(grievanceService.listMine(principal));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<Page<GrievanceResponse>> listByStatus(@RequestParam GrievanceStatus status, Pageable pageable) {
        return ResponseEntity.ok(grievanceService.listByStatus(status, pageable));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
    public ResponseEntity<GrievanceResponse> updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateGrievanceStatusRequest request) {
        return ResponseEntity.ok(grievanceService.updateStatus(id, request));
    }

    @GetMapping("/sla-matrix")
    public ResponseEntity<List<SlaMatrixEntry>> slaMatrix() {
        return ResponseEntity.ok(grievanceService.slaMatrix());
    }
}
