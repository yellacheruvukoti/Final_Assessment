package com.infy.registration.dto;

import java.util.UUID;

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
public class RegistrationCreateRequest {

    @NotNull
    private UUID studentId;

    @NotNull
    private UUID assessmentId;

    @Size(max = 20)
    private String sourceChannel;
}
