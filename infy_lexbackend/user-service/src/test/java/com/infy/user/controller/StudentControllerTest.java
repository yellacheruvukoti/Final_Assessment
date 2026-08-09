package com.infy.user.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;

import com.infy.user.dto.StudentResponse;
import com.infy.user.dto.StudentStatusResponse;
import com.infy.user.exception.BusinessException;
import com.infy.user.service.StudentService;

/**
 * Controller-level (API contract) tests, distinct from the TASK-020
 * service-layer unit tests — exercises real Spring MVC dispatch, JSON
 * envelope shape, and GlobalExceptionHandler status mapping.
 * TC-API-USER-001..003. Self-defined test case IDs — test.md is empty.
 */
@WebMvcTest(StudentController.class)
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StudentService studentService;

    @Test
    void tcApiUser001_getStudent_found_returnsSuccessEnvelope() throws Exception {
        UUID studentId = UUID.randomUUID();
        when(studentService.getStudent(studentId)).thenReturn(
                StudentResponse.builder().studentId(studentId).studentCode("STU-0001").build());

        mockMvc.perform(get("/api/students/{studentId}", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.studentCode", is("STU-0001")));
    }

    @Test
    void tcApiUser002_getStudent_notFound_returns404WithStudentNotFoundCode() throws Exception {
        UUID studentId = UUID.randomUUID();
        when(studentService.getStudent(studentId)).thenThrow(
                new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND", "Student not found"));

        mockMvc.perform(get("/api/students/{studentId}", studentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("STUDENT_NOT_FOUND")));
    }

    @Test
    void tcApiUser003_getStudentStatus_returnsActiveFlag() throws Exception {
        UUID studentId = UUID.randomUUID();
        when(studentService.getStudentStatus(any(UUID.class))).thenReturn(
                StudentStatusResponse.builder().studentId(studentId).active(true).build());

        mockMvc.perform(get("/api/students/{studentId}/status", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active", is(true)));
    }
}
