package com.passportsahayak.grievance.repository;

import com.passportsahayak.grievance.entity.Grievance;
import com.passportsahayak.grievance.entity.GrievanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByComplainantUserIdOrderByCreatedAtDesc(Long complainantUserId);
    Page<Grievance> findByStatus(GrievanceStatus status, Pageable pageable);
}
