package com.infy.user.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.user.dto.AdministratorResponse;
import com.infy.user.exception.BusinessException;
import com.infy.user.mapper.AdministratorMapper;
import com.infy.user.repository.AdministratorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdministratorService {

    private final AdministratorRepository administratorRepository;

    public AdministratorResponse getAdministrator(UUID administratorId) {
        return administratorRepository.findById(administratorId)
                .map(AdministratorMapper::toResponse)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ADMINISTRATOR_NOT_FOUND",
                        "Administrator not found for id " + administratorId));
    }
}
