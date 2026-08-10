package com.infy.user.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class BatchCreateRequest {

    @NotBlank
    @Size(max = 30)
    private String batchCode;

    @NotBlank
    @Size(max = 100)
    private String batchName;

    @NotNull
    private UUID ownerId;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;
}
