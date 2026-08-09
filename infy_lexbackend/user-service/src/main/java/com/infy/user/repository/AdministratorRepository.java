package com.infy.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.user.entity.Administrator;

public interface AdministratorRepository extends JpaRepository<Administrator, UUID> {

    Optional<Administrator> findByUserId(UUID userId);

    Optional<Administrator> findByAdminCode(String adminCode);
}
