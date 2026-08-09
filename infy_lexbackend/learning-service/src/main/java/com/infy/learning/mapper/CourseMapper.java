package com.infy.learning.mapper;

import com.infy.learning.dto.CourseCreateRequest;
import com.infy.learning.dto.CourseResponse;
import com.infy.learning.dto.CourseUpdateRequest;
import com.infy.learning.entity.Course;

public final class CourseMapper {

    private CourseMapper() {
    }

    public static CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .courseCode(course.getCourseCode())
                .title(course.getTitle())
                .description(course.getDescription())
                .status(course.getStatus())
                .instructorId(course.getInstructorId())
                .publishedAt(course.getPublishedAt())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    public static Course toEntity(CourseCreateRequest request) {
        return Course.builder()
                .courseCode(request.getCourseCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .instructorId(request.getInstructorId())
                .build();
    }

    public static void applyUpdate(Course course, CourseUpdateRequest request) {
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setStatus(request.getStatus());
    }
}
