package com.infy.learning.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.dto.CourseCreateRequest;
import com.infy.learning.dto.CourseResponse;
import com.infy.learning.dto.CourseUpdateRequest;
import com.infy.learning.entity.Course;
import com.infy.learning.enums.CourseStatus;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.mapper.CourseMapper;
import com.infy.learning.repository.CourseRepository;

import lombok.RequiredArgsConstructor;

/**
 * Course discovery and management (FR-001, FR-004). Discovery (BR-001) is
 * limited to PUBLISHED courses; management is owner-scoped via
 * CourseAuthorizationService.
 */
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseAuthorizationService authorizationService;

    public List<CourseResponse> listPublishedCourses() {
        return courseRepository.findByStatus(CourseStatus.PUBLISHED).stream()
                .map(CourseMapper::toResponse)
                .toList();
    }

    public CourseResponse getCourse(UUID courseId) {
        return CourseMapper.toResponse(findCourseOrThrow(courseId));
    }

    public CourseResponse createCourse(CourseCreateRequest request, String role, UUID requesterUserId) {
        authorizationService.requireCourseOwnership(role, requesterUserId, request.getInstructorId());
        Course course = CourseMapper.toEntity(request);
        course.setStatus(CourseStatus.DRAFT);
        return CourseMapper.toResponse(courseRepository.save(course));
    }

    public CourseResponse updateCourse(UUID courseId, CourseUpdateRequest request, String role,
            UUID requesterUserId) {
        Course course = findCourseOrThrow(courseId);
        authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());

        boolean becomingPublished = request.getStatus() == CourseStatus.PUBLISHED
                && course.getStatus() != CourseStatus.PUBLISHED;
        CourseMapper.applyUpdate(course, request);
        if (becomingPublished) {
            course.setPublishedAt(LocalDateTime.now());
        }
        return CourseMapper.toResponse(courseRepository.save(course));
    }

    Course findCourseOrThrow(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND",
                        "Course not found for id " + courseId));
    }
}
