package com.infy.learning.dto;

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
public class LearningMaterialCreateRequest {

    @NotNull
    private UUID moduleId;

    @NotBlank
    @Size(min = 3, max = 200)
    private String title;

    @NotBlank
    private String materialType;

    @NotBlank
    @Size(max = 500)
    private String resourcePath;

    @NotBlank
    private String accessLevel;
}
