package com.infy.user.dto;

import com.infy.user.enums.InstructorStatus;

import jakarta.validation.constraints.Email;
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
public class InstructorUpdateRequest {

    @Size(min = 2, max = 100)
    private String fullName;

    @Email
    @Size(max = 255)
    private String email;

    @Size(max = 255)
    private String specialization;

    private InstructorStatus status;
}
