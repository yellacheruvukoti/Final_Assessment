package com.infy.user.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.user.dto.InstructorCreateRequest;
import com.infy.user.dto.InstructorResponse;
import com.infy.user.dto.InstructorUpdateRequest;
import com.infy.user.entity.Instructor;
import com.infy.user.entity.User;
import com.infy.user.enums.InstructorStatus;
import com.infy.user.enums.UserRole;
import com.infy.user.enums.UserStatus;
import com.infy.user.exception.BusinessException;
import com.infy.user.mapper.InstructorMapper;
import com.infy.user.repository.InstructorRepository;
import com.infy.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;

    @Transactional
    public InstructorResponse createInstructor(InstructorCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(HttpStatus.CONFLICT, "VALIDATION_ERROR",
                    "A user with this email already exists.");
        }

        User user = User.builder()
                .userCode(generateCode("USR"))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(UserRole.INSTRUCTOR)
                .status(UserStatus.ACTIVE)
                .build();
        User savedUser = userRepository.save(user);

        Instructor instructor = Instructor.builder()
                .userId(savedUser.getUserId())
                .instructorCode(generateCode("INS"))
                .specialization(request.getSpecialization())
                .status(InstructorStatus.ACTIVE)
                .build();
        return InstructorMapper.toResponse(instructorRepository.save(instructor));
    }

    @Transactional
    public InstructorResponse updateInstructor(UUID instructorId, InstructorUpdateRequest request) {
        Instructor instructor = findInstructorOrThrow(instructorId);
        User user = userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "INSTRUCTOR_NOT_FOUND",
                        "Linked user not found for instructor " + instructorId));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(HttpStatus.CONFLICT, "VALIDATION_ERROR",
                    "A user with this email already exists.");
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

        if (request.getSpecialization() != null) {
            instructor.setSpecialization(request.getSpecialization());
        }
        if (request.getStatus() != null) {
            instructor.setStatus(request.getStatus());
        }
        return InstructorMapper.toResponse(instructorRepository.save(instructor));
    }

    @Transactional
    public void deactivateInstructor(UUID instructorId) {
        Instructor instructor = findInstructorOrThrow(instructorId);
        User user = userRepository.findById(instructor.getUserId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "INSTRUCTOR_NOT_FOUND",
                        "Linked user not found for instructor " + instructorId));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        instructor.setStatus(InstructorStatus.INACTIVE);
        instructorRepository.save(instructor);
    }

    private static String generateCode(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public InstructorResponse getInstructor(UUID instructorId) {
        return InstructorMapper.toResponse(findInstructorOrThrow(instructorId));
    }

    /**
     * Internal contract (not gateway-routed) consumed by summary-service to
     * resolve the requesting user's instructor identity for batch-ownership
     * authorization (VR-010).
     */
    public InstructorResponse getInstructorByUserId(UUID userId) {
        Instructor instructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "INSTRUCTOR_NOT_FOUND",
                        "Instructor not found for user id " + userId));
        return InstructorMapper.toResponse(instructor);
    }

    private Instructor findInstructorOrThrow(UUID instructorId) {
        return instructorRepository.findById(instructorId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "INSTRUCTOR_NOT_FOUND",
                        "Instructor not found for id " + instructorId));
    }
}
