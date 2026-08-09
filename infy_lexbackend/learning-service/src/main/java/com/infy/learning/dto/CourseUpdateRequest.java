package com.infy.learning.dto;

import com.infy.learning.enums.CourseStatus;

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
public class CourseUpdateRequest {

    @NotBlank
    @Size(min = 3, max = 150)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotNull
    private CourseStatus status;
}
