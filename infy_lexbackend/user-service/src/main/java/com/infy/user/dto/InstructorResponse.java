package com.infy.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.user.enums.InstructorStatus;

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
public class InstructorResponse {
    private UUID instructorId;
    private UUID userId;
    private String instructorCode;
    private String specialization;
    private InstructorStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
