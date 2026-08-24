package com.passportsahayak.fraud.repository;

import com.passportsahayak.fraud.entity.EscalationCase;
import com.passportsahayak.fraud.entity.EscalationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EscalationCaseRepository extends JpaRepository<EscalationCase, Long> {
    List<EscalationCase> findByArnOrderByCreatedAtDesc(String arn);
    Page<EscalationCase> findByStatus(EscalationStatus status, Pageable pageable);
}
