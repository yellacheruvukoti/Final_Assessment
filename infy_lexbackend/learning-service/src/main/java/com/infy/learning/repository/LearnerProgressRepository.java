package com.infy.learning.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.learning.entity.LearnerProgress;

public interface LearnerProgressRepository extends JpaRepository<LearnerProgress, UUID> {

    List<LearnerProgress> findByStudentIdAndCourseId(UUID studentId, UUID courseId);

    Optional<LearnerProgress> findByStudentIdAndCourseIdAndModuleId(UUID studentId, UUID courseId, UUID moduleId);

    List<LearnerProgress> findByCourseId(UUID courseId);
}
