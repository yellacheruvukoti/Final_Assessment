package com.infy.learning.dto;

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
public class QuizQuestionCreateRequest {

    @NotBlank
    @Size(min = 5, max = 2000)
    private String questionText;

    @NotBlank
    private String questionType;

    private String difficultyLevel;

    @NotNull
    @Positive
    private Integer marks;

    @NotBlank
    @Size(max = 1000)
    private String optionSet;

    @NotBlank
    @Size(max = 100)
    private String correctAnswerKey;
}
