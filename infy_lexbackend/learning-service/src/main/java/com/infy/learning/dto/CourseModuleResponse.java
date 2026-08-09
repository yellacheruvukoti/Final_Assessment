package com.infy.learning.dto;

import java.time.LocalDateTime;
import java.util.UUID;

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
public class CourseModuleResponse {
    private UUID moduleId;
    private UUID courseId;
    private String title;
    private Integer moduleOrder;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
