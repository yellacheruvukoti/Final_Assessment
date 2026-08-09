package com.infy.certification.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.infy.certification.dto.CertificateDownloadResponse;
import com.infy.certification.dto.CertificateResponse;
import com.infy.certification.enums.CertificateStatus;
import com.infy.certification.exception.BusinessException;
import com.infy.certification.service.CertificateService;

/**
 * TC-API-CERT-001..004. Self-defined test case IDs — test.md is empty.
 */
@WebMvcTest(CertificateController.class)
class CertificateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CertificateService certificateService;

    @Test
    void tcApiCert001_issueCertificate_scoreBelowThreshold_returns422() throws Exception {
        when(certificateService.issueCertificate(any())).thenThrow(
                new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "SCORE_BELOW_THRESHOLD", "Score too low"));

        String body = """
                {
                  "studentId": "11111111-1111-1111-1111-111111111111",
                  "assessmentId": "22222222-2222-2222-2222-222222222222",
                  "score": 45.0
                }
                """;

        mockMvc.perform(post("/api/certificates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code", is("SCORE_BELOW_THRESHOLD")));
    }

    @Test
    void tcApiCert002_issueCertificate_missingScore_returns400ValidationError() throws Exception {
        String body = """
                {
                  "studentId": "11111111-1111-1111-1111-111111111111",
                  "assessmentId": "22222222-2222-2222-2222-222222222222"
                }
                """;

        mockMvc.perform(post("/api/certificates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void tcApiCert003_getCertificate_found_returnsIssuedStatus() throws Exception {
        UUID certificateId = UUID.randomUUID();
        when(certificateService.getCertificate(certificateId)).thenReturn(
                CertificateResponse.builder().certificateId(certificateId).status(CertificateStatus.ISSUED).build());

        mockMvc.perform(get("/api/certificates/{id}", certificateId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ISSUED")));
    }

    @Test
    void tcApiCert004_downloadCertificate_returnsDownloadToken() throws Exception {
        UUID certificateId = UUID.randomUUID();
        when(certificateService.downloadCertificate(certificateId)).thenReturn(
                CertificateDownloadResponse.builder().certificateId(certificateId).downloadToken("dlt-abc123").build());

        mockMvc.perform(get("/api/certificates/{id}/download", certificateId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.downloadToken", is("dlt-abc123")));
    }
}
