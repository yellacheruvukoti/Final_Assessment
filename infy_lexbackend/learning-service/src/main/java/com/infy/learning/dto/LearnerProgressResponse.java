package com.infy.learning.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.learning.enums.ProgressStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearnerProgressResponse {
    private UUID progressId;
    private UUID studentId;
    private UUID courseId;
    private UUID moduleId;
    private Double completionPercentage;
    private ProgressStatus progressStatus;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime updatedAt;
}
