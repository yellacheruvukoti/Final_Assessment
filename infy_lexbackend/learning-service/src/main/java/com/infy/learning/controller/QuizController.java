package com.infy.learning.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.learning.dto.ApiResponse;
import com.infy.learning.dto.AssessmentQuizProgressResponse;
import com.infy.learning.dto.QuizAttemptResponse;
import com.infy.learning.dto.QuizCreateRequest;
import com.infy.learning.dto.QuizQuestionCreateRequest;
import com.infy.learning.dto.QuizQuestionResponse;
import com.infy.learning.dto.QuizResponse;
import com.infy.learning.dto.QuizSubmissionRequest;
import com.infy.learning.dto.QuizUpdateRequest;
import com.infy.learning.service.AssessmentCompletionService;
import com.infy.learning.service.QuizAttemptService;
import com.infy.learning.service.QuizQuestionService;
import com.infy.learning.service.QuizService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final QuizQuestionService quizQuestionService;
    private final QuizAttemptService quizAttemptService;
    private final AssessmentCompletionService assessmentCompletionService;

    @PostMapping
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(@Valid @RequestBody QuizCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quiz created successfully.", quizService.createQuiz(request, role, userId)));
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(@PathVariable UUID quizId,
            @Valid @RequestBody QuizUpdateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Quiz updated successfully.", quizService.updateQuiz(quizId, request, role, userId)));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuiz(@PathVariable UUID quizId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Quiz retrieved successfully.", quizService.getQuiz(quizId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizResponse>>> listByAssessment(
            @RequestParam UUID assessmentId) {
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Quizzes retrieved successfully.", quizService.listByAssessment(assessmentId)));
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<ApiResponse<List<QuizQuestionResponse>>> listQuestions(@PathVariable UUID quizId,
            @RequestHeader(value = "X-Role", required = false) String role) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Quiz questions retrieved successfully.",
                quizQuestionService.listByQuiz(quizId, role)));
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<ApiResponse<QuizQuestionResponse>> addQuestion(@PathVariable UUID quizId,
            @Valid @RequestBody QuizQuestionCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz question added successfully.",
                quizQuestionService.addQuestion(quizId, request, role, userId)));
    }

    @PutMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<ApiResponse<QuizQuestionResponse>> updateQuestion(@PathVariable UUID quizId,
            @PathVariable UUID questionId, @Valid @RequestBody QuizQuestionCreateRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Quiz question updated successfully.",
                quizQuestionService.updateQuestion(quizId, questionId, request, role, userId)));
    }

    @DeleteMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable UUID quizId,
            @PathVariable UUID questionId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        quizQuestionService.deleteQuestion(quizId, questionId, role, userId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Quiz question deleted successfully.", null));
    }

    @PostMapping("/{quizId}/attempts")
    public ResponseEntity<ApiResponse<QuizAttemptResponse>> submitAttempt(@PathVariable UUID quizId,
            @Valid @RequestBody QuizSubmissionRequest request,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz submitted successfully.",
                quizAttemptService.submitAttempt(quizId, request, role, userId)));
    }

    @GetMapping("/{quizId}/attempts/me")
    public ResponseEntity<ApiResponse<QuizAttemptResponse>> getMyAttempt(@PathVariable UUID quizId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success("Attempt retrieved successfully.", quizAttemptService.getMyAttempt(quizId, role, userId)));
    }

    @GetMapping("/assessment-progress/{assessmentId}/{studentId}")
    public ResponseEntity<ApiResponse<AssessmentQuizProgressResponse>> getAssessmentProgress(
            @PathVariable UUID assessmentId, @PathVariable UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Assessment quiz progress retrieved successfully.",
                assessmentCompletionService.getProgress(assessmentId, studentId)));
    }
}
