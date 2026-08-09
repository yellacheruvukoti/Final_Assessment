package com.infy.user.mapper;

import com.infy.user.dto.InstructorResponse;
import com.infy.user.entity.Instructor;

public final class InstructorMapper {

    private InstructorMapper() {
    }

    public static InstructorResponse toResponse(Instructor instructor) {
        return InstructorResponse.builder()
                .instructorId(instructor.getInstructorId())
                .userId(instructor.getUserId())
                .instructorCode(instructor.getInstructorCode())
                .specialization(instructor.getSpecialization())
                .status(instructor.getStatus())
                .createdAt(instructor.getCreatedAt())
                .updatedAt(instructor.getUpdatedAt())
                .build();
    }
}
