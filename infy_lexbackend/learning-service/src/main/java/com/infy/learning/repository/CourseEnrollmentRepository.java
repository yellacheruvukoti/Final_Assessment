package com.infy.learning.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.learning.entity.CourseEnrollment;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {

    Optional<CourseEnrollment> findByStudentIdAndCourseId(UUID studentId, UUID courseId);

    List<CourseEnrollment> findByCourseId(UUID courseId);

    List<CourseEnrollment> findByStudentId(UUID studentId);
}
