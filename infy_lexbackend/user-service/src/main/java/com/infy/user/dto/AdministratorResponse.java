package com.infy.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.user.enums.AdminStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdministratorResponse {
    private UUID administratorId;
    private UUID userId;
    private String adminCode;
    private AdminStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
