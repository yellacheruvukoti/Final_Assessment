package com.infy.learning.mapper;

import com.infy.learning.dto.LearningMaterialCreateRequest;
import com.infy.learning.dto.LearningMaterialResponse;
import com.infy.learning.entity.LearningMaterial;

public final class LearningMaterialMapper {

    private LearningMaterialMapper() {
    }

    public static LearningMaterialResponse toResponse(LearningMaterial material) {
        return LearningMaterialResponse.builder()
                .materialId(material.getMaterialId())
                .moduleId(material.getModuleId())
                .title(material.getTitle())
                .materialType(material.getMaterialType())
                .resourcePath(material.getResourcePath())
                .accessLevel(material.getAccessLevel())
                .status(material.getStatus())
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }

    public static LearningMaterial toEntity(LearningMaterialCreateRequest request) {
        return LearningMaterial.builder()
                .moduleId(request.getModuleId())
                .title(request.getTitle())
                .materialType(request.getMaterialType())
                .resourcePath(request.getResourcePath())
                .accessLevel(request.getAccessLevel())
                .status("ACTIVE")
                .build();
    }
}
