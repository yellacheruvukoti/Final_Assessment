package com.infy.learning.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.infy.learning.dto.CourseModuleCreateRequest;
import com.infy.learning.dto.CourseModuleResponse;
import com.infy.learning.entity.Course;
import com.infy.learning.mapper.CourseModuleMapper;
import com.infy.learning.repository.CourseModuleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseModuleService {

    private final CourseModuleRepository courseModuleRepository;
    private final CourseService courseService;
    private final CourseAuthorizationService authorizationService;

    public List<CourseModuleResponse> listModules(UUID courseId) {
        return courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId).stream()
                .map(CourseModuleMapper::toResponse)
                .toList();
    }

    public CourseModuleResponse addModule(UUID courseId, CourseModuleCreateRequest request, String role,
            UUID requesterUserId) {
        Course course = courseService.findCourseOrThrow(courseId);
        authorizationService.requireCourseOwnership(role, requesterUserId, course.getInstructorId());
        return CourseModuleMapper.toResponse(
                courseModuleRepository.save(CourseModuleMapper.toEntity(courseId, request)));
    }
}
