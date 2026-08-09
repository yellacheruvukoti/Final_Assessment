package com.infy.learning.mapper;

import java.util.UUID;

import com.infy.learning.dto.CourseModuleCreateRequest;
import com.infy.learning.dto.CourseModuleResponse;
import com.infy.learning.entity.CourseModule;

public final class CourseModuleMapper {

    private CourseModuleMapper() {
    }

    public static CourseModuleResponse toResponse(CourseModule module) {
        return CourseModuleResponse.builder()
                .moduleId(module.getModuleId())
                .courseId(module.getCourseId())
                .title(module.getTitle())
                .moduleOrder(module.getModuleOrder())
                .status(module.getStatus())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }

    public static CourseModule toEntity(UUID courseId, CourseModuleCreateRequest request) {
        return CourseModule.builder()
                .courseId(courseId)
                .title(request.getTitle())
                .moduleOrder(request.getModuleOrder())
                .status("ACTIVE")
                .build();
    }
}
