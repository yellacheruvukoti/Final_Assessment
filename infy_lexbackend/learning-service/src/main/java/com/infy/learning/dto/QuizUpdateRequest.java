package com.infy.learning.dto;

import java.time.LocalDateTime;

import com.infy.learning.enums.QuizStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class QuizUpdateRequest {

    @NotBlank
    @Size(min = 3, max = 150)
    private String title;

    @NotNull
    private QuizStatus status;

    private LocalDateTime scheduledAt;

    @NotNull
    @Positive
    private Integer durationMinutes;

    @NotNull
    @Positive
    private Integer totalMarks;
}
