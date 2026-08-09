package com.infy.learning.controller;

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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.infy.learning.dto.CourseResponse;
import com.infy.learning.enums.CourseStatus;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.service.CourseEnrollmentService;
import com.infy.learning.service.CourseModuleService;
import com.infy.learning.service.CourseService;
import com.infy.learning.service.LearnerProgressService;
import com.infy.learning.service.LearningMaterialService;
import com.infy.learning.service.QuizService;

/**
 * TC-API-LEARN-001..003. Self-defined test case IDs — test.md is empty.
 */
@WebMvcTest(CourseController.class)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService courseService;
    @MockBean
    private CourseModuleService courseModuleService;
    @MockBean
    private LearningMaterialService learningMaterialService;
    @MockBean
    private CourseEnrollmentService courseEnrollmentService;
    @MockBean
    private QuizService quizService;
    @MockBean
    private LearnerProgressService learnerProgressService;

    @Test
    void tcApiLearn001_listCourses_returnsPublishedCourses() throws Exception {
        when(courseService.listPublishedCourses()).thenReturn(List.of(
                CourseResponse.builder().courseId(UUID.randomUUID()).status(CourseStatus.PUBLISHED).build()));

        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", org.hamcrest.Matchers.hasSize(1)));
    }

    @Test
    void tcApiLearn002_createCourse_missingFields_returns400ValidationError() throws Exception {
        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .header("X-Role", "INSTRUCTOR"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")));
    }

    @Test
    void tcApiLearn003_addModule_nonOwnerInstructor_returns403() throws Exception {
        UUID courseId = UUID.randomUUID();
        when(courseModuleService.addModule(any(), any(), any(), any())).thenThrow(
                new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED", "Not the owner"));

        String body = """
                { "title": "Module 1", "moduleOrder": 1 }
                """;

        mockMvc.perform(post("/api/courses/{courseId}/modules", courseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("X-Role", "INSTRUCTOR"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code", is("COURSE_ACCESS_DENIED")));
    }
}
