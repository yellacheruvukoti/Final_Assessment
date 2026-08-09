package com.infy.learning.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.client.StudentInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.entity.Course;
import com.infy.learning.entity.CourseModule;
import com.infy.learning.dto.LearningMaterialCreateRequest;
import com.infy.learning.dto.LearningMaterialResponse;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.mapper.LearningMaterialMapper;
import com.infy.learning.repository.CourseEnrollmentRepository;
import com.infy.learning.repository.CourseModuleRepository;
import com.infy.learning.repository.LearningMaterialRepository;

import lombok.RequiredArgsConstructor;

/**
 * Learning material access control (FR-002, VR-004, VR-005): Student access
 * requires an active enrollment in the owning course; Instructor owner and
 * Administrator always have access. Upload (POST) requires course ownership.
 */
@Service
@RequiredArgsConstructor
public class LearningMaterialService {

    private static final String ROLE_STUDENT = "STUDENT";
    private static final String ROLE_ADMINISTRATOR = "ADMINISTRATOR";
    private static final String ROLE_INSTRUCTOR = "INSTRUCTOR";
    private static final String ENROLLMENT_ACTIVE = "ACTIVE";

    private final LearningMaterialRepository learningMaterialRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseService courseService;
    private final CourseAuthorizationService authorizationService;
    private final UserServiceClient userServiceClient;

    public List<LearningMaterialResponse> listMaterialsForCourse(UUID courseId, String role, UUID requesterUserId) {
        Course course = courseService.findCourseOrThrow(courseId);
        requireMaterialAccess(course, role, requesterUserId);

        List<UUID> moduleIds = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId).stream()
                .map(CourseModule::getModuleId)
                .toList();
        return learningMaterialRepository.findByModuleIdIn(moduleIds).stream()
                .map(LearningMaterialMapper::toResponse)
                .toList();
    }

    public LearningMaterialResponse addMaterial(UUID courseId, LearningMaterialCreateRequest request, String role,
            UUID requesterUserId) {
        Course course = courseService.findCourseOrThrow(courseId);
        authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());

        courseModuleRepository.findById(request.getModuleId())
                .filter(module -> module.getCourseId().equals(courseId))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND",
                        "Module " + request.getModuleId() + " does not belong to course " + courseId));

        return LearningMaterialMapper.toResponse(
                learningMaterialRepository.save(LearningMaterialMapper.toEntity(request)));
    }

    private void requireMaterialAccess(Course course, String role, UUID requesterUserId) {
        if (role != null && role.equalsIgnoreCase(ROLE_ADMINISTRATOR)) {
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_INSTRUCTOR) && requesterUserId != null) {
            authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_STUDENT) && requesterUserId != null) {
            StudentInfo student = userServiceClient.getStudentByUserId(requesterUserId).orElse(null);
            if (student != null) {
                boolean enrolled = courseEnrollmentRepository
                        .findByStudentIdAndCourseId(student.getStudentId(), course.getCourseId())
                        .filter(enrollment -> ENROLLMENT_ACTIVE.equals(enrollment.getEnrollmentStatus()))
                        .isPresent();
                if (enrolled) {
                    return;
                }
            }
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_NOT_ENROLLED",
                    "Student is not enrolled in this course.");
        }
        throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                "You are not authorized to access this course's materials.");
    }
}
