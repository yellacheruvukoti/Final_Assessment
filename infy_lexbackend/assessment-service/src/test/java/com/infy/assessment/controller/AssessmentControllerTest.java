package com.infy.assessment.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.infy.assessment.dto.AssessmentResponse;
import com.infy.assessment.enums.AssessmentStatus;
import com.infy.assessment.service.AssessmentService;

/**
 * TC-API-ASSESS-001..003. Self-defined test case IDs — test.md is empty.
 */
@WebMvcTest(AssessmentController.class)
class AssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AssessmentService assessmentService;

    @Test
    void tcApiAssess001_listUpcoming_returnsSuccessEnvelope() throws Exception {
        when(assessmentService.listUpcoming()).thenReturn(List.of(
                AssessmentResponse.builder().assessmentId(UUID.randomUUID()).status(AssessmentStatus.PUBLISHED).build()));

        mockMvc.perform(get("/api/assessments/upcoming"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", org.hamcrest.Matchers.hasSize(1)));
    }

    @Test
    void tcApiAssess002_createAssessment_missingRequiredFields_returns400ValidationError() throws Exception {
        mockMvc.perform(post("/api/assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void tcApiAssess003_createAssessment_valid_returns201Created() throws Exception {
        when(assessmentService.createAssessment(any())).thenReturn(
                AssessmentResponse.builder().assessmentId(UUID.randomUUID()).status(AssessmentStatus.DRAFT).build());

        String body = """
                {
                  "assessmentCode": "ASM-TEST-01",
                  "title": "Test Assessment",
                  "status": "DRAFT",
                  "startTime": "2030-01-01T10:00:00",
                  "endTime": "2030-01-01T12:00:00",
                  "durationMinutes": 60,
                  "scopeType": "COURSE",
                  "scopeId": "11111111-1111-1111-1111-111111111111"
                }
                """;

        mockMvc.perform(post("/api/assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
