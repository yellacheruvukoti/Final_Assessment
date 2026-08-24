package com.passportsahayak.appointment.repository;

import com.passportsahayak.appointment.entity.PskCenter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PskCenterRepository extends JpaRepository<PskCenter, Long> {
    List<PskCenter> findByActiveTrue();
    Optional<PskCenter> findByCode(String code);
    boolean existsByCode(String code);
}
