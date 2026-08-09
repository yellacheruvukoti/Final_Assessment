package com.infy.learning.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.learning.entity.Course;
import com.infy.learning.enums.CourseStatus;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    Optional<Course> findByCourseCode(String courseCode);

    List<Course> findByStatus(CourseStatus status);

    List<Course> findByInstructorId(UUID instructorId);
}
