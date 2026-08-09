package com.infy.learning.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.learning.dto.CourseCreateRequest;
import com.infy.learning.dto.CourseUpdateRequest;
import com.infy.learning.entity.Course;
import com.infy.learning.enums.CourseStatus;
import com.infy.learning.repository.CourseRepository;

/**
 * Course lifecycle (FR-001/FR-004, BR-001). Self-defined test case IDs —
 * test.md is empty.
 */
@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CourseAuthorizationService authorizationService;

    @InjectMocks
    private CourseService courseService;

    @Test
    void tcLearn008_createCourse_defaultsToDraftStatus() {
        UUID instructorId = UUID.randomUUID();
        CourseCreateRequest request = CourseCreateRequest.builder()
                .courseCode("CRS-0099").title("New Course").instructorId(instructorId).build();
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = courseService.createCourse(request, "ADMINISTRATOR", UUID.randomUUID());

        assertThat(response.getStatus()).isEqualTo(CourseStatus.DRAFT);
    }

    @Test
    void tcLearn009_updateCourse_toPublished_setsPublishedAt() {
        UUID courseId = UUID.randomUUID();
        Course course = Course.builder().courseId(courseId).status(CourseStatus.DRAFT).build();
        CourseUpdateRequest request = CourseUpdateRequest.builder()
                .title("Updated Title").status(CourseStatus.PUBLISHED).build();
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = courseService.updateCourse(courseId, request, "ADMINISTRATOR", UUID.randomUUID());

        assertThat(response.getStatus()).isEqualTo(CourseStatus.PUBLISHED);
        assertThat(response.getPublishedAt()).isNotNull();
    }
}
