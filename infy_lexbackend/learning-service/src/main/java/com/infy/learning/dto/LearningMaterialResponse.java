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
public class LearningMaterialResponse {
    private UUID materialId;
    private UUID moduleId;
    private String title;
    private String materialType;
    private String resourcePath;
    private String accessLevel;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
