package com.infy.learning.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infy.learning.client.InstructorInfo;
import com.infy.learning.client.UserServiceClient;
import com.infy.learning.exception.BusinessException;

/**
 * Course ownership authorization (VR-002/VR-003, BR-003). Self-defined test
 * case IDs — test.md is empty.
 */
@ExtendWith(MockitoExtension.class)
class CourseAuthorizationServiceTest {

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private CourseAuthorizationService authorizationService;

    @Test
    void tcLearn001_administrator_alwaysAuthorized() {
        UUID courseInstructorId = UUID.randomUUID();
        assertThatCode(() -> authorizationService.requireCourseOwnership("ADMINISTRATOR", UUID.randomUUID(), courseInstructorId))
                .doesNotThrowAnyException();
    }

    @Test
    void tcLearn002_ownerInstructor_isAuthorized() {
        UUID courseInstructorId = UUID.randomUUID();
        UUID requesterUserId = UUID.randomUUID();
        when(userServiceClient.getInstructorByUserId(requesterUserId))
                .thenReturn(Optional.of(InstructorInfo.builder().instructorId(courseInstructorId).userId(requesterUserId).build()));

        assertThatCode(() -> authorizationService.requireCourseOwnership("INSTRUCTOR", requesterUserId, courseInstructorId))
                .doesNotThrowAnyException();
    }

    @Test
    void tcLearn003_nonOwnerInstructor_throwsCourseAccessDenied() {
        UUID courseInstructorId = UUID.randomUUID();
        UUID requesterUserId = UUID.randomUUID();
        UUID differentInstructorId = UUID.randomUUID();
        when(userServiceClient.getInstructorByUserId(requesterUserId))
                .thenReturn(Optional.of(InstructorInfo.builder().instructorId(differentInstructorId).userId(requesterUserId).build()));

        assertThatThrownBy(() -> authorizationService.requireCourseOwnership("INSTRUCTOR", requesterUserId, courseInstructorId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> org.assertj.core.api.Assertions.assertThat(((BusinessException) ex).getCode())
                        .isEqualTo("COURSE_ACCESS_DENIED"));
    }

    @Test
    void tcLearn004_studentRole_throwsCourseAccessDenied() {
        assertThatThrownBy(() -> authorizationService.requireCourseOwnership("STUDENT", UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(BusinessException.class);
    }
}
