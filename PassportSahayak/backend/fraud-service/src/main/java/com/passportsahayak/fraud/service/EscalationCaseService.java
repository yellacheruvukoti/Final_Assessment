package com.passportsahayak.fraud.service;

import com.passportsahayak.fraud.dto.CreateEscalationRequest;
import com.passportsahayak.fraud.dto.EscalationCaseResponse;
import com.passportsahayak.fraud.dto.UpdateEscalationStatusRequest;
import com.passportsahayak.fraud.entity.EscalationCase;
import com.passportsahayak.fraud.entity.EscalationStatus;
import com.passportsahayak.fraud.exception.ApiException;
import com.passportsahayak.fraud.repository.EscalationCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Special escalation cases per KB-PASS-007 Section 3 (disputed parentage, repeated lost
 * passport, denied NOC).
 */
@Service
@RequiredArgsConstructor
public class EscalationCaseService {

    private final EscalationCaseRepository repository;

    @Transactional
    public EscalationCaseResponse create(CreateEscalationRequest req) {
        EscalationCase escalation = EscalationCase.builder()
                .arn(req.arn())
                .type(req.type())
                .details(req.details())
                .status(EscalationStatus.OPEN)
                .build();
        return EscalationCaseResponse.from(repository.save(escalation));
    }

    public List<EscalationCaseResponse> getByArn(String arn) {
        return repository.findByArnOrderByCreatedAtDesc(arn).stream().map(EscalationCaseResponse::from).toList();
    }

    public Page<EscalationCaseResponse> listByStatus(EscalationStatus status, Pageable pageable) {
        return repository.findByStatus(status, pageable).map(EscalationCaseResponse::from);
    }

    @Transactional
    public EscalationCaseResponse updateStatus(Long id, UpdateEscalationStatusRequest req) {
        EscalationCase escalation = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Escalation case not found"));
        escalation.setStatus(req.status());
        return EscalationCaseResponse.from(repository.save(escalation));
    }
}
