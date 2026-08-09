package com.infy.learning.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.learning.client.InstructorInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.dto.CoursePerformanceItem;
import com.infy.learning.dto.InstructorPerformanceResponse;
import com.infy.learning.entity.Course;
import com.infy.learning.entity.CourseEnrollment;
import com.infy.learning.entity.LearnerProgress;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.repository.CourseEnrollmentRepository;
import com.infy.learning.repository.CourseRepository;
import com.infy.learning.repository.LearnerProgressRepository;

import lombok.RequiredArgsConstructor;

/**
 * Instructor learner-performance dashboard (FR-013), scoped to courses owned
 * by the instructor. Role access: Instructor (self scope), Administrator.
 */
@Service
@RequiredArgsConstructor
public class InstructorPerformanceService {

    private static final String ROLE_ADMINISTRATOR = "ADMINISTRATOR";
    private static final String ROLE_INSTRUCTOR = "INSTRUCTOR";

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final LearnerProgressRepository learnerProgressRepository;
    private final UserServiceClient userServiceClient;

    public InstructorPerformanceResponse getPerformance(UUID instructorId, String role, UUID requesterUserId) {
        requireSelfScope(instructorId, role, requesterUserId);

        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        Set<UUID> uniqueStudents = new java.util.HashSet<>();
        List<Double> allCompletions = new java.util.ArrayList<>();

        List<CoursePerformanceItem> items = courses.stream().map(course -> {
            List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByCourseId(course.getCourseId());
            enrollments.forEach(e -> uniqueStudents.add(e.getStudentId()));

            List<LearnerProgress> progressRecords = learnerProgressRepository.findByCourseId(course.getCourseId());
            List<Double> courseCompletions = progressRecords.stream()
                    .map(LearnerProgress::getCompletionPercentage)
                    .toList();
            allCompletions.addAll(courseCompletions);

            double avg = courseCompletions.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            return CoursePerformanceItem.builder()
                    .courseId(course.getCourseId())
                    .title(course.getTitle())
                    .enrolledCount(enrollments.size())
                    .averageCompletionPercentage(avg)
                    .build();
        }).toList();

        double overallAverage = allCompletions.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        return InstructorPerformanceResponse.builder()
                .instructorId(instructorId)
                .totalCourses(courses.size())
                .totalStudents(uniqueStudents.size())
                .averageCompletionPercentage(overallAverage)
                .courses(items)
                .build();
    }

    private void requireSelfScope(UUID instructorId, String role, UUID requesterUserId) {
        if (role != null && role.equalsIgnoreCase(ROLE_ADMINISTRATOR)) {
            return;
        }
        if (role != null && role.equalsIgnoreCase(ROLE_INSTRUCTOR) && requesterUserId != null) {
            InstructorInfo instructor = userServiceClient.getInstructorByUserId(requesterUserId).orElse(null);
            if (instructor != null && instructor.getInstructorId().equals(instructorId)) {
                return;
            }
        }
        throw new BusinessException(HttpStatus.FORBIDDEN, "COURSE_ACCESS_DENIED",
                "You are not authorized to view this instructor's performance data.");
    }
}
