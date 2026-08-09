package com.infy.learning.mapper;

import com.infy.learning.dto.LearnerProgressResponse;
import com.infy.learning.entity.LearnerProgress;

public final class LearnerProgressMapper {

    private LearnerProgressMapper() {
    }

    public static LearnerProgressResponse toResponse(LearnerProgress progress) {
        return LearnerProgressResponse.builder()
                .progressId(progress.getProgressId())
                .studentId(progress.getStudentId())
                .courseId(progress.getCourseId())
                .moduleId(progress.getModuleId())
                .completionPercentage(progress.getCompletionPercentage())
                .progressStatus(progress.getProgressStatus())
                .lastAccessedAt(progress.getLastAccessedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
