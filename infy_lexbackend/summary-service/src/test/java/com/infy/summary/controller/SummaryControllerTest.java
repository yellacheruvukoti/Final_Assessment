package com.infy.summary.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;

import com.infy.summary.dto.RegistrationSummaryResponse;
import com.infy.summary.exception.BusinessException;
import com.infy.summary.service.SummaryService;

/**
 * TC-API-SUMMARY-001..002. Self-defined test case IDs — test.md is empty.
 */
@WebMvcTest(SummaryController.class)
class SummaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SummaryService summaryService;

    @Test
    void tcApiSummary001_getBatchSummary_administrator_returnsTotals() throws Exception {
        UUID batchId = UUID.randomUUID();
        when(summaryService.getBatchSummary(eq(batchId), eq("ADMINISTRATOR"), any()))
                .thenReturn(RegistrationSummaryResponse.builder()
                        .batchId(batchId).totalRegistered(5).totalCancelled(1).generatedAt(LocalDateTime.now()).build());

        mockMvc.perform(get("/api/summaries/batches/{batchId}", batchId).header("X-Role", "ADMINISTRATOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRegistered", is(5)));
    }

    @Test
    void tcApiSummary002_getBatchSummary_unauthorizedInstructor_returns403() throws Exception {
        UUID batchId = UUID.randomUUID();
        when(summaryService.getBatchSummary(eq(batchId), eq("INSTRUCTOR"), any())).thenThrow(
                new BusinessException(HttpStatus.FORBIDDEN, "SUMMARY_ACCESS_DENIED", "Not authorized"));

        mockMvc.perform(get("/api/summaries/batches/{batchId}", batchId).header("X-Role", "INSTRUCTOR"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code", is("SUMMARY_ACCESS_DENIED")));
    }
}
