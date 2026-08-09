package com.infy.learning.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.infy.learning.enums.CourseStatus;

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
public class CourseResponse {
    private UUID courseId;
    private String courseCode;
    private String title;
    private String description;
    private CourseStatus status;
    private UUID instructorId;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
