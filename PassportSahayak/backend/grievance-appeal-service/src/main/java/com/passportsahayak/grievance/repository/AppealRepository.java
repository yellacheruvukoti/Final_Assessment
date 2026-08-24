package com.passportsahayak.grievance.repository;

import com.passportsahayak.grievance.entity.Appeal;
import com.passportsahayak.grievance.entity.AppealStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppealRepository extends JpaRepository<Appeal, Long> {
    List<Appeal> findByArnOrderByCreatedAtDesc(String arn);
    Page<Appeal> findByStatus(AppealStatus status, Pageable pageable);
}
