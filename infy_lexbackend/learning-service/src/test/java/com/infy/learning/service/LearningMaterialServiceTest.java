package com.infy.learning.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.learning.client.StudentInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.entity.Course;
import com.infy.learning.entity.CourseEnrollment;
import com.infy.learning.enums.CourseStatus;
import com.infy.learning.exception.BusinessException;
import com.infy.learning.repository.CourseEnrollmentRepository;
import com.infy.learning.repository.CourseModuleRepository;
import com.infy.learning.repository.LearningMaterialRepository;

/**
 * Learning material access control (FR-002, VR-004, VR-005). Self-defined
 * test case IDs — test.md is empty.
 */
@ExtendWith(MockitoExtension.class)
class LearningMaterialServiceTest {

    @Mock
    private LearningMaterialRepository learningMaterialRepository;
    @Mock
    private CourseModuleRepository courseModuleRepository;
    @Mock
    private CourseEnrollmentRepository courseEnrollmentRepository;
    @Mock
    private CourseService courseService;
    @Mock
    private CourseAuthorizationService authorizationService;
    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private LearningMaterialService learningMaterialService;

    private final UUID courseId = UUID.randomUUID();
    private final UUID instructorId = UUID.randomUUID();

    private Course course() {
        return Course.builder().courseId(courseId).instructorId(instructorId).status(CourseStatus.PUBLISHED).build();
    }

    @Test
    void tcLearn005_listMaterials_enrolledStudent_isAuthorized() {
        UUID requesterUserId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        when(courseService.findCourseOrThrow(courseId)).thenReturn(course());
        when(userServiceClient.getStudentByUserId(requesterUserId))
                .thenReturn(Optional.of(StudentInfo.builder().studentId(studentId).userId(requesterUserId).build()));
        when(courseEnrollmentRepository.findByStudentIdAndCourseId(studentId, courseId))
                .thenReturn(Optional.of(CourseEnrollment.builder().enrollmentStatus("ACTIVE").build()));
        when(courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId)).thenReturn(List.of());
        when(learningMaterialRepository.findByModuleIdIn(List.of())).thenReturn(List.of());

        var result = learningMaterialService.listMaterialsForCourse(courseId, "STUDENT", requesterUserId);

        assertThat(result).isEmpty();
    }

    @Test
    void tcLearn006_listMaterials_notEnrolledStudent_throwsCourseNotEnrolled() {
        UUID requesterUserId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        when(courseService.findCourseOrThrow(courseId)).thenReturn(course());
        when(userServiceClient.getStudentByUserId(requesterUserId))
                .thenReturn(Optional.of(StudentInfo.builder().studentId(studentId).userId(requesterUserId).build()));
        when(courseEnrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> learningMaterialService.listMaterialsForCourse(courseId, "STUDENT", requesterUserId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("COURSE_NOT_ENROLLED"));
    }

    @Test
    void tcLearn007_listMaterials_administrator_alwaysAuthorized() {
        when(courseService.findCourseOrThrow(courseId)).thenReturn(course());
        when(courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId)).thenReturn(List.of());
        when(learningMaterialRepository.findByModuleIdIn(List.of())).thenReturn(List.of());

        var result = learningMaterialService.listMaterialsForCourse(courseId, "ADMINISTRATOR", UUID.randomUUID());

        assertThat(result).isEmpty();
    }
}
