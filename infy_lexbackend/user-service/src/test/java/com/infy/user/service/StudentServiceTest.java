package com.infy.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.user.entity.Student;
import com.infy.user.entity.User;
import com.infy.user.enums.UserRole;
import com.infy.user.enums.UserStatus;
import com.infy.user.repository.BatchRepository;
import com.infy.user.repository.StudentRepository;
import com.infy.user.repository.UserRepository;

/**
 * TC-STUDENT-001: active linked user -> active=true.
 * TC-STUDENT-002: inactive linked user -> active=false (backs the
 * STUDENT_NOT_FOUND rejection in registration/certification clients).
 */
@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private BatchRepository batchRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StudentService studentService;

    @Test
    void tcStudent001_getStudentStatus_activeUser_returnsActiveTrue() {
        UUID studentId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Student student = Student.builder().studentId(studentId).userId(userId).studentCode("STU-0001").build();
        User user = User.builder().userId(userId).role(UserRole.STUDENT).status(UserStatus.ACTIVE).build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        var response = studentService.getStudentStatus(studentId);

        assertThat(response.isActive()).isTrue();
    }

    @Test
    void tcStudent002_getStudentStatus_inactiveUser_returnsActiveFalse() {
        UUID studentId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Student student = Student.builder().studentId(studentId).userId(userId).studentCode("STU-0002").build();
        User user = User.builder().userId(userId).role(UserRole.STUDENT).status(UserStatus.INACTIVE).build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        var response = studentService.getStudentStatus(studentId);

        assertThat(response.isActive()).isFalse();
    }
}
