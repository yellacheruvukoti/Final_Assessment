package com.infy.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

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
public class StudentResponse {
    private UUID studentId;
    private UUID userId;
    private String studentCode;
    private UUID batchId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
