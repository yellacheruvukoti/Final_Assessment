package com.infy.learning.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.learning.entity.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {

    List<Quiz> findByCourseId(UUID courseId);

    Optional<Quiz> findByCourseIdAndTitle(UUID courseId, String title);
}
