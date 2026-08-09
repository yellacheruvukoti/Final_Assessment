package com.infy.learning.mapper;

import com.infy.learning.dto.CourseEnrollmentResponse;
import com.infy.learning.entity.CourseEnrollment;

public final class CourseEnrollmentMapper {

    private CourseEnrollmentMapper() {
    }

    public static CourseEnrollmentResponse toResponse(CourseEnrollment enrollment) {
        return CourseEnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .courseId(enrollment.getCourseId())
                .studentId(enrollment.getStudentId())
                .enrollmentStatus(enrollment.getEnrollmentStatus())
                .enrolledAt(enrollment.getEnrolledAt())
                .createdAt(enrollment.getCreatedAt())
                .updatedAt(enrollment.getUpdatedAt())
                .build();
    }
}
