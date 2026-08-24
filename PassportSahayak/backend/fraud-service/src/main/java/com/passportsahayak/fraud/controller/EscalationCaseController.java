package com.passportsahayak.fraud.controller;

import com.passportsahayak.fraud.dto.CreateEscalationRequest;
import com.passportsahayak.fraud.dto.EscalationCaseResponse;
import com.passportsahayak.fraud.dto.UpdateEscalationStatusRequest;
import com.passportsahayak.fraud.entity.EscalationStatus;
import com.passportsahayak.fraud.service.EscalationCaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fraud/escalations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PSK_OFFICIAL','RPO_OFFICIAL','ADMIN')")
public class EscalationCaseController {

    private final EscalationCaseService escalationCaseService;

    @PostMapping
    public ResponseEntity<EscalationCaseResponse> create(@Valid @RequestBody CreateEscalationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(escalationCaseService.create(request));
    }

    @GetMapping("/{arn}")
    public ResponseEntity<List<EscalationCaseResponse>> byArn(@PathVariable String arn) {
        return ResponseEntity.ok(escalationCaseService.getByArn(arn));
    }

    @GetMapping
    public ResponseEntity<Page<EscalationCaseResponse>> listByStatus(@RequestParam EscalationStatus status, Pageable pageable) {
        return ResponseEntity.ok(escalationCaseService.listByStatus(status, pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EscalationCaseResponse> updateStatus(@PathVariable Long id,
                                                                  @Valid @RequestBody UpdateEscalationStatusRequest request) {
        return ResponseEntity.ok(escalationCaseService.updateStatus(id, request));
    }
}
