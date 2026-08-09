package com.infy.user.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.user.entity.Student;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByUserId(UUID userId);

    Optional<Student> findByStudentCode(String studentCode);

    List<Student> findByBatchId(UUID batchId);
}
