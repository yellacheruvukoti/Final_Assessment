package com.infy.learning.dto;

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
public class CoursePerformanceItem {
    private UUID courseId;
    private String title;
    private Integer enrolledCount;
    private Double averageCompletionPercentage;
}
