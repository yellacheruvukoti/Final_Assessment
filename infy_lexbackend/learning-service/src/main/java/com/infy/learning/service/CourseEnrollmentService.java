package com.infy.learning.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.client.StudentInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.dto.CourseEnrollmentCreateRequest;
import com.infy.learning.dto.CourseEnrollmentResponse;
import com.infy.learning.entity.CourseEnrollment;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.mapper.CourseEnrollmentMapper;
import com.infy.learning.repository.CourseEnrollmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseEnrollmentService {

    private static final String ROLE_ADMINISTRATOR = "ADMINISTRATOR";
    private static final String ROLE_STUDENT = "STUDENT";

    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseService courseService;
    private final UserServiceClient userServiceClient;

    public CourseEnrollmentResponse enroll(UUID courseId, CourseEnrollmentCreateRequest request) {
        courseService.findCourseOrThrow(courseId);

        courseEnrollmentRepository.findByStudentIdAndCourseId(request.getStudentId(), courseId)
                .ifPresent(existing -> {
                    throw new BusinessException(HttpStatus.CONFLICT, "VALIDATION_ERROR",
                            "Student is already enrolled in this course.");
                });

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .courseId(courseId)
                .studentId(request.getStudentId())
                .enrollmentStatus("ACTIVE")
                .enrolledAt(LocalDateTime.now())
                .build();
        return CourseEnrollmentMapper.toResponse(courseEnrollmentRepository.save(enrollment));
    }

    public List<CourseEnrollmentResponse> listForStudent(UUID studentId, String role, UUID requesterUserId) {
        requireOwnOrAdmin(studentId, role, requesterUserId);
        return courseEnrollmentRepository.findByStudentId(studentId).stream()
                .map(CourseEnrollmentMapper::toResponse)
                .toList();
    }

    private void requireOwnOrAdmin(UUID studentId, String role, UUID requesterUserId) {
        if (role != null && role.equalsIgnoreCase(ROLE_ADMINISTRATOR)) {
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_STUDENT) && requesterUserId != null) {
            StudentInfo student = userServiceClient.getStudentByUserId(requesterUserId).orElse(null);
            if (student != null && student.getStudentId().equals(studentId)) {
                return;
            }
        }
        throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                "You are not authorized to view this learner's enrollments.");
    }
}
