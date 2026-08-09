package com.infy.learning.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.learning.dto.QuizCreateRequest;
import com.infy.learning.entity.Course;
import com.infy.learning.entity.Quiz;
import com.infy.learning.enums.CourseStatus;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.repository.QuizRepository;

/**
 * Quiz lifecycle and ownership consistency (FR-006, VR-006). Self-defined
 * test case IDs — test.md is empty.
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;
    @Mock
    private CourseService courseService;
    @Mock
    private CourseAuthorizationService authorizationService;

    @InjectMocks
    private QuizService quizService;

    @Test
    void tcLearn010_createQuiz_ownerMismatchesCourseInstructor_throwsCourseAccessDenied() {
        UUID courseId = UUID.randomUUID();
        UUID courseInstructorId = UUID.randomUUID();
        UUID differentOwnerId = UUID.randomUUID();
        Course course = Course.builder().courseId(courseId).instructorId(courseInstructorId)
                .status(CourseStatus.PUBLISHED).build();
        QuizCreateRequest request = QuizCreateRequest.builder()
                .courseId(courseId).title("Quiz 1").durationMinutes(30).totalMarks(10)
                .ownerInstructorId(differentOwnerId).build();
        when(courseService.findCourseOrThrow(courseId)).thenReturn(course);

        assertThatThrownBy(() -> quizService.createQuiz(request, "ADMINISTRATOR", UUID.randomUUID()))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("COURSE_ACCESS_DENIED"));
    }

    @Test
    void tcLearn011_createQuiz_ownerMatchesCourseInstructor_succeeds() {
        UUID courseId = UUID.randomUUID();
        UUID courseInstructorId = UUID.randomUUID();
        Course course = Course.builder().courseId(courseId).instructorId(courseInstructorId)
                .status(CourseStatus.PUBLISHED).build();
        QuizCreateRequest request = QuizCreateRequest.builder()
                .courseId(courseId).title("Quiz 1").durationMinutes(30).totalMarks(10)
                .ownerInstructorId(courseInstructorId).build();
        when(courseService.findCourseOrThrow(courseId)).thenReturn(course);
        when(quizRepository.save(any(Quiz.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = quizService.createQuiz(request, "ADMINISTRATOR", UUID.randomUUID());

        assertThat(response.getOwnerInstructorId()).isEqualTo(courseInstructorId);
    }
}
