package com.infy.learning.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.learning.entity.LearningMaterial;

public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, UUID> {

    List<LearningMaterial> findByModuleId(UUID moduleId);

    List<LearningMaterial> findByModuleIdIn(Collection<UUID> moduleIds);
}
