package com.infy.user.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.user.entity.User;
import com.infy.user.enums.UserRole;
import com.infy.user.enums.UserStatus;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUserCode(String userCode);

    Optional<User> findByEmail(String email);

    boolean existsByUserCode(String userCode);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);

    List<User> findByStatus(UserStatus status);

    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
}
