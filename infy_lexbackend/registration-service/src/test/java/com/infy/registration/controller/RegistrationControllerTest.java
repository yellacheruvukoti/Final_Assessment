package com.infy.registration.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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

import com.infy.registration.dto.RegistrationResponse;
import com.infy.registration.enums.RegistrationStatus;
import com.infy.registration.exception.BusinessException;
import com.infy.registration.service.RegistrationService;

/**
 * TC-API-REG-001..004. Self-defined test case IDs — test.md is empty.
 */
@WebMvcTest(RegistrationController.class)
class RegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RegistrationService registrationService;

    @Test
    void tcApiReg001_register_missingFields_returns400ValidationError() throws Exception {
        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void tcApiReg002_register_valid_returns201Created() throws Exception {
        when(registrationService.register(any())).thenReturn(
                RegistrationResponse.builder().registrationId(UUID.randomUUID()).status(RegistrationStatus.REGISTERED).build());

        String body = """
                {
                  "studentId": "11111111-1111-1111-1111-111111111111",
                  "assessmentId": "22222222-2222-2222-2222-222222222222",
                  "sourceChannel": "WEB"
                }
                """;

        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("REGISTERED")));
    }

    @Test
    void tcApiReg003_register_duplicate_returns409WithDuplicateRegistrationCode() throws Exception {
        when(registrationService.register(any())).thenThrow(
                new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_REGISTRATION", "Already registered"));

        String body = """
                {
                  "studentId": "11111111-1111-1111-1111-111111111111",
                  "assessmentId": "22222222-2222-2222-2222-222222222222"
                }
                """;

        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("DUPLICATE_REGISTRATION")));
    }

    @Test
    void tcApiReg004_cancel_returnsCancelledStatus() throws Exception {
        UUID registrationId = UUID.randomUUID();
        when(registrationService.cancel(registrationId)).thenReturn(
                RegistrationResponse.builder().registrationId(registrationId).status(RegistrationStatus.CANCELLED).build());

        mockMvc.perform(patch("/api/registrations/{id}/cancel", registrationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("CANCELLED")));
    }
}
