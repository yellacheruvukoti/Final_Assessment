package com.passportsahayak.appointment.service;

import com.passportsahayak.appointment.dto.CenterResponse;
import com.passportsahayak.appointment.repository.PskCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CenterService {

    private final PskCenterRepository repository;

    public List<CenterResponse> listActive() {
        return repository.findByActiveTrue().stream().map(CenterResponse::from).toList();
    }
}
