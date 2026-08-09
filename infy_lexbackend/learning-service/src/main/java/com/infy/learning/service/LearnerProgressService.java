package com.infy.learning.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.client.StudentInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.entity.Course;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.mapper.LearnerProgressMapper;
import com.infy.learning.dto.LearnerProgressResponse;
import com.infy.learning.repository.LearnerProgressRepository;

import lombok.RequiredArgsConstructor;

/**
 * Learner progress views (FR-003): Student may view only their own progress;
 * Instructor only for courses they own; Administrator unrestricted.
 */
@Service
@RequiredArgsConstructor
public class LearnerProgressService {

    private static final String ROLE_STUDENT = "STUDENT";
    private static final String ROLE_ADMINISTRATOR = "ADMINISTRATOR";
    private static final String ROLE_INSTRUCTOR = "INSTRUCTOR";

    private final LearnerProgressRepository learnerProgressRepository;
    private final CourseService courseService;
    private final CourseAuthorizationService authorizationService;
    private final UserServiceClient userServiceClient;

    public List<LearnerProgressResponse> getProgress(UUID courseId, UUID studentId, String role,
            UUID requesterUserId) {
        Course course = courseService.findCourseOrThrow(courseId);
        requireProgressAccess(course, studentId, role, requesterUserId);
        return learnerProgressRepository.findByStudentIdAndCourseId(studentId, courseId).stream()
                .map(LearnerProgressMapper::toResponse)
                .toList();
    }

    private void requireProgressAccess(Course course, UUID studentId, String role, UUID requesterUserId) {
        if (role != null && role.equalsIgnoreCase(ROLE_ADMINISTRATOR)) {
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_INSTRUCTOR)) {
            authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_STUDENT) && requesterUserId != null) {
            StudentInfo student = userServiceClient.getStudentByUserId(requesterUserId).orElse(null);
            if (student != null && student.getStudentId().equals(studentId)) {
                return;
            }
        }
        throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                "You are not authorized to view this learner's progress.");
    }
}
