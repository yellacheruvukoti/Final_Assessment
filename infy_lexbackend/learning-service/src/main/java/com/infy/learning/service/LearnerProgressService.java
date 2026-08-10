package com.infy.learning.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.client.StudentInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.entity.Course;
import com.infy.learning.entity.CourseModule;
import com.infy.learning.entity.LearnerProgress;
import com.infy.learning.entity.LearningMaterial;
import com.infy.learning.entity.LessonProgress;
import com.infy.learning.enums.ProgressStatus;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.mapper.LearnerProgressMapper;
import com.infy.learning.dto.LearnerProgressResponse;
import com.infy.learning.repository.CourseEnrollmentRepository;
import com.infy.learning.repository.CourseModuleRepository;
import com.infy.learning.repository.LearnerProgressRepository;
import com.infy.learning.repository.LearningMaterialRepository;
import com.infy.learning.repository.LessonProgressRepository;

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
    private static final String ENROLLMENT_ACTIVE = "ACTIVE";

    private final LearnerProgressRepository learnerProgressRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LearningMaterialRepository learningMaterialRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
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

    /**
     * Marks one lesson (LearningMaterial) complete for the currently logged-in
     * student and recomputes both the owning module's and the course-level
     * LearnerProgress rollup rows from real LessonProgress records — this is
     * the only write path onto learner_progress; previously no such path
     * existed anywhere in the backend (progress was static seed data).
     */
    public List<LearnerProgressResponse> markLessonComplete(UUID courseId, UUID materialId, String role,
            UUID requesterUserId) {
        Course course = courseService.findCourseOrThrow(courseId);
        UUID studentId = resolveEnrolledStudent(course, role, requesterUserId);

        LearningMaterial material = learningMaterialRepository.findById(materialId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MATERIAL_NOT_FOUND",
                        "Material not found for id " + materialId));
        CourseModule module = courseModuleRepository.findById(material.getModuleId())
                .filter(m -> m.getCourseId().equals(courseId))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND",
                        "Material " + materialId + " does not belong to course " + courseId));

        if (lessonProgressRepository.findByStudentIdAndMaterialId(studentId, materialId).isEmpty()) {
            lessonProgressRepository.save(LessonProgress.builder()
                    .studentId(studentId)
                    .courseId(courseId)
                    .moduleId(module.getModuleId())
                    .materialId(materialId)
                    .build());
        }

        recomputeModuleProgress(studentId, courseId, module.getModuleId());
        recomputeCourseProgress(studentId, courseId);

        return learnerProgressRepository.findByStudentIdAndCourseId(studentId, courseId).stream()
                .map(LearnerProgressMapper::toResponse)
                .toList();
    }

    private void recomputeModuleProgress(UUID studentId, UUID courseId, UUID moduleId) {
        int totalInModule = learningMaterialRepository.findByModuleId(moduleId).size();
        int completedInModule = lessonProgressRepository.findByStudentIdAndModuleId(studentId, moduleId).size();
        upsertProgress(studentId, courseId, moduleId, totalInModule, completedInModule);
    }

    private void recomputeCourseProgress(UUID studentId, UUID courseId) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
        int totalInCourse = learningMaterialRepository
                .findByModuleIdIn(modules.stream().map(CourseModule::getModuleId).toList()).size();
        int completedInCourse = lessonProgressRepository.findByStudentIdAndCourseId(studentId, courseId).size();
        upsertProgress(studentId, courseId, null, totalInCourse, completedInCourse);
    }

    private void upsertProgress(UUID studentId, UUID courseId, UUID moduleId, int total, int completed) {
        double percentage = total == 0 ? 0.0 : (completed * 100.0) / total;
        ProgressStatus status = total > 0 && completed >= total ? ProgressStatus.COMPLETED
                : completed > 0 ? ProgressStatus.IN_PROGRESS : ProgressStatus.NOT_STARTED;

        LearnerProgress progress = learnerProgressRepository
                .findByStudentIdAndCourseIdAndModuleId(studentId, courseId, moduleId)
                .orElseGet(() -> LearnerProgress.builder()
                        .studentId(studentId)
                        .courseId(courseId)
                        .moduleId(moduleId)
                        .build());
        progress.setCompletionPercentage(Math.round(percentage * 100.0) / 100.0);
        progress.setProgressStatus(status);
        progress.setLastAccessedAt(LocalDateTime.now());
        learnerProgressRepository.save(progress);
    }

    private UUID resolveEnrolledStudent(Course course, String role, UUID requesterUserId) {
        if (role == null || !role.equalsIgnoreCase(ROLE_STUDENT) || requesterUserId == null) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                    "Only the enrolled student may update their own lesson progress.");
        }
        StudentInfo student = userServiceClient.getStudentByUserId(requesterUserId).orElse(null);
        if (student == null) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                    "Unable to resolve the requesting student.");
        }
        boolean enrolled = courseEnrollmentRepository
                .findByStudentIdAndCourseId(student.getStudentId(), course.getCourseId())
                .filter(e -> ENROLLMENT_ACTIVE.equals(e.getEnrollmentStatus()))
                .isPresent();
        if (!enrolled) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_NOT_ENROLLED",
                    "Student is not enrolled in this course.");
        }
        return student.getStudentId();
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
