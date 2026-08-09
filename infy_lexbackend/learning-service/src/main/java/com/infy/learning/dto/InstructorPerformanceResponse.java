package com.infy.learning.dto;

import java.util.List;
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
public class InstructorPerformanceResponse {
    private UUID instructorId;
    private Integer totalCourses;
    private Integer totalStudents;
    private Double averageCompletionPercentage;
    private List<CoursePerformanceItem> courses;
}
