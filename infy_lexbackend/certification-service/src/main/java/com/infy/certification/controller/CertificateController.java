package com.infy.certification.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.certification.dto.ApiResponse;
import com.infy.certification.dto.CertificateDownloadResponse;
import com.infy.certification.dto.CertificateIssueRequest;
import com.infy.certification.dto.CertificateResponse;
import com.infy.certification.enums.CertificateStatus;
import com.infy.certification.service.CertificateService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> listCertificates(
            @RequestParam(required = false) CertificateStatus status) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Certificates retrieved successfully.",
                certificateService.listCertificates(status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CertificateResponse>> issueCertificate(
            @Valid @RequestBody CertificateIssueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Certificate issued successfully.", certificateService.issueCertificate(request)));
    }

    @GetMapping("/{certificateId}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificate(@PathVariable UUID certificateId) {
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Certificate retrieved successfully.", certificateService.getCertificate(certificateId)));
    }

    @GetMapping("/{certificateId}/download")
    public ResponseEntity<ApiResponse<CertificateDownloadResponse>> downloadCertificate(
            @PathVariable UUID certificateId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Certificate ready for download.",
                certificateService.downloadCertificate(certificateId)));
    }

    /**
     * Not in api-contract.md's route catalog, but clarification.md Section 13
     * requires Administrator revocation and TASK-014 names "certificate
     * status management" as a deliverable — added as a PATCH .../revoke
     * action mirroring registration-service's cancel/reregister convention.
     */
    @PatchMapping("/{certificateId}/revoke")
    public ResponseEntity<ApiResponse<CertificateResponse>> revokeCertificate(@PathVariable UUID certificateId) {
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Certificate revoked successfully.", certificateService.revokeCertificate(certificateId)));
    }
}
