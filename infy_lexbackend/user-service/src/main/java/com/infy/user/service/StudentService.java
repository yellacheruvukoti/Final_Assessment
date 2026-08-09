package com.infy.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.user.dto.StudentBatchResponse;
import com.infy.user.dto.StudentCreateRequest;
import com.infy.user.dto.StudentResponse;
import com.infy.user.dto.StudentStatusResponse;
import com.infy.user.dto.StudentUpdateRequest;
import com.infy.user.entity.Batch;
import com.infy.user.entity.Student;
import com.infy.user.entity.User;
import com.infy.user.enums.UserRole;
import com.infy.user.enums.UserStatus;
import com.infy.user.exception.BusinessException;
import com.infy.user.mapper.StudentMapper;
import com.infy.user.repository.BatchRepository;
import com.infy.user.repository.StudentRepository;
import com.infy.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;

    @Transactional
    public StudentResponse createStudent(StudentCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(HttpStatus.CONFLICT, "VALIDATION_ERROR",
                    "A user with this email already exists.");
        }
        if (request.getBatchId() != null && batchRepository.findById(request.getBatchId()).isEmpty()) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "BATCH_NOT_FOUND",
                    "Batch not found for id " + request.getBatchId());
        }

        User user = User.builder()
                .userCode(generateCode("USR"))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
        User savedUser = userRepository.save(user);

        Student student = Student.builder()
                .userId(savedUser.getUserId())
                .studentCode(generateCode("STU"))
                .batchId(request.getBatchId())
                .build();
        return StudentMapper.toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse updateStudent(UUID studentId, StudentUpdateRequest request) {
        Student student = findStudentOrThrow(studentId);
        User user = userRepository.findById(student.getUserId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                        "Linked user not found for student " + studentId));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(HttpStatus.CONFLICT, "VALIDATION_ERROR",
                    "A user with this email already exists.");
        }
        if (request.getBatchId() != null && batchRepository.findById(request.getBatchId()).isEmpty()) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "BATCH_NOT_FOUND",
                    "Batch not found for id " + request.getBatchId());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        userRepository.save(user);

        if (request.getBatchId() != null) {
            student.setBatchId(request.getBatchId());
        }
        return StudentMapper.toResponse(studentRepository.save(student));
    }

    @Transactional
    public void deactivateStudent(UUID studentId) {
        Student student = findStudentOrThrow(studentId);
        User user = userRepository.findById(student.getUserId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                        "Linked user not found for student " + studentId));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    private static String generateCode(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public StudentResponse getStudent(UUID studentId) {
        return StudentMapper.toResponse(findStudentOrThrow(studentId));
    }

    public StudentBatchResponse getStudentBatch(UUID studentId) {
        Student student = findStudentOrThrow(studentId);
        if (student.getBatchId() == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                    "Student " + studentId + " has no batch assigned.");
        }
        Batch batch = batchRepository.findById(student.getBatchId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                        "Batch not found for student " + studentId));
        return StudentMapper.toBatchResponse(student, batch);
    }

    public StudentStatusResponse getStudentStatus(UUID studentId) {
        Student student = findStudentOrThrow(studentId);
        User user = userRepository.findById(student.getUserId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                        "Linked user not found for student " + studentId));
        boolean active = user.getStatus() == UserStatus.ACTIVE;
        return StudentMapper.toStatusResponse(student, active);
    }

    /**
     * Internal contract (not gateway-routed) consumed by summary-service to
     * resolve a batch's student ids before querying registration-service.
     */
    public List<StudentResponse> getStudentsByBatch(UUID batchId) {
        return studentRepository.findByBatchId(batchId).stream()
                .map(StudentMapper::toResponse)
                .toList();
    }

    /**
     * Internal contract (not gateway-routed) consumed by learning-service to
     * resolve the requesting user's student identity from X-User-Id, since
     * CourseEnrollment.studentId / LearnerProgress.studentId store the
     * Student profile id rather than the User id (VR-004).
     */
    public StudentResponse getStudentByUserId(UUID userId) {
        return studentRepository.findByUserId(userId)
                .map(StudentMapper::toResponse)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                        "Student not found for user id " + userId));
    }

    private Student findStudentOrThrow(UUID studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND",
                        "Student not found for id " + studentId));
    }
}
