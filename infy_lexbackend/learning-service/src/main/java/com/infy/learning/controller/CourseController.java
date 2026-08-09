package com.infy.learning.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.learning.dto.ApiResponse;
import com.infy.learning.dto.CourseCreateRequest;
import com.infy.learning.dto.CourseEnrollmentCreateRequest;
import com.infy.learning.dto.CourseEnrollmentResponse;
import com.infy.learning.dto.CourseModuleCreateRequest;
import com.infy.learning.dto.CourseModuleResponse;
import com.infy.learning.dto.CourseResponse;
import com.infy.learning.dto.CourseUpdateRequest;
import com.infy.learning.dto.LearnerProgressResponse;
import com.infy.learning.dto.LearningMaterialCreateRequest;
import com.infy.learning.dto.LearningMaterialResponse;
import com.infy.learning.dto.QuizResponse;
import com.infy.learning.service.CourseEnrollmentService;
import com.infy.learning.service.CourseModuleService;
import com.infy.learning.service.CourseService;
import com.infy.learning.service.LearnerProgressService;
import com.infy.learning.service.LearningMaterialService;
import com.infy.learning.service.QuizService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseModuleService courseModuleService;
    private final LearningMaterialService learningMaterialService;
    private final CourseEnrollmentService courseEnrollmentService;
    private final QuizService quizService;
    private final LearnerProgressService learnerProgressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> listCourses() {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Courses retrieved successfully.", courseService.listPublishedCourses()));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable UUID courseId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Course retrieved successfully.", courseService.getCourse(courseId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Course created successfully.", courseService.createCourse(request, role, userId)));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(@PathVariable UUID courseId,
            @Valid @RequestBody CourseUpdateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Course updated successfully.",
                courseService.updateCourse(courseId, request, role, userId)));
    }

    @PostMapping("/{courseId}/modules")
    public ResponseEntity<ApiResponse<CourseModuleResponse>> addModule(@PathVariable UUID courseId,
            @Valid @RequestBody CourseModuleCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Module added successfully.",
                courseModuleService.addModule(courseId, request, role, userId)));
    }

    @GetMapping("/{courseId}/materials")
    public ResponseEntity<ApiResponse<List<LearningMaterialResponse>>> listMaterials(@PathVariable UUID courseId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Materials retrieved successfully.",
                learningMaterialService.listMaterialsForCourse(courseId, role, userId)));
    }

    @PostMapping("/{courseId}/materials")
    public ResponseEntity<ApiResponse<LearningMaterialResponse>> addMaterial(@PathVariable UUID courseId,
            @Valid @RequestBody LearningMaterialCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Material added successfully.",
                learningMaterialService.addMaterial(courseId, request, role, userId)));
    }

    @PostMapping("/{courseId}/enrollments")
    public ResponseEntity<ApiResponse<CourseEnrollmentResponse>> enroll(@PathVariable UUID courseId,
            @Valid @RequestBody CourseEnrollmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Enrollment created successfully.", courseEnrollmentService.enroll(courseId, request)));
    }

    @GetMapping("/enrollments/student/{studentId}")
    public ResponseEntity<ApiResponse<List<CourseEnrollmentResponse>>> listEnrollmentsForStudent(
            @PathVariable UUID studentId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Enrollments retrieved successfully.",
                courseEnrollmentService.listForStudent(studentId, role, userId)));
    }

    @GetMapping("/{courseId}/quizzes")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> listQuizzes(@PathVariable UUID courseId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Quizzes retrieved successfully.", quizService.listByCourse(courseId)));
    }

    @GetMapping("/{courseId}/progress/{studentId}")
    public ResponseEntity<ApiResponse<List<LearnerProgressResponse>>> getProgress(@PathVariable UUID courseId,
            @PathVariable UUID studentId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Progress retrieved successfully.",
                learnerProgressService.getProgress(courseId, studentId, role, userId)));
    }
}
