package com.infy.learning.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.learning.entity.LessonProgress;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {

    Optional<LessonProgress> findByStudentIdAndMaterialId(UUID studentId, UUID materialId);

    List<LessonProgress> findByStudentIdAndModuleId(UUID studentId, UUID moduleId);

    List<LessonProgress> findByStudentIdAndCourseId(UUID studentId, UUID courseId);
}
