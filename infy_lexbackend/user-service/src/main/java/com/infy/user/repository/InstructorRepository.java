package com.infy.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.user.entity.Instructor;

public interface InstructorRepository extends JpaRepository<Instructor, UUID> {

    Optional<Instructor> findByUserId(UUID userId);

    Optional<Instructor> findByInstructorCode(String instructorCode);
}
