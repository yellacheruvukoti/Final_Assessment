package com.infy.user.mapper;

import com.infy.user.dto.StudentBatchResponse;
import com.infy.user.dto.StudentResponse;
import com.infy.user.dto.StudentStatusResponse;
import com.infy.user.entity.Batch;
import com.infy.user.entity.Student;

public final class StudentMapper {

    private StudentMapper() {
    }

    public static StudentResponse toResponse(Student student) {
        return StudentResponse.builder()
                .studentId(student.getStudentId())
                .userId(student.getUserId())
                .studentCode(student.getStudentCode())
                .batchId(student.getBatchId())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    public static StudentBatchResponse toBatchResponse(Student student, Batch batch) {
        return StudentBatchResponse.builder()
                .studentId(student.getStudentId())
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .batchName(batch.getBatchName())
                .build();
    }

    public static StudentStatusResponse toStatusResponse(Student student, boolean active) {
        return StudentStatusResponse.builder()
                .studentId(student.getStudentId())
                .userId(student.getUserId())
                .active(active)
                .build();
    }
}
