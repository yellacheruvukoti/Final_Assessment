import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { CourseStatus } from '../../../../core/models/course.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InstructorCourseApiService } from '../../services/instructor-course-api.service';
import { CourseCreatePageComponent } from './course-create-page.component';

describe('CourseCreatePageComponent', () => {
  let component: CourseCreatePageComponent;
  let fixture: ComponentFixture<CourseCreatePageComponent>;
  let instructorCourseApiSpy: jasmine.SpyObj<InstructorCourseApiService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const createdCourse = {
    courseId: 'c1',
    courseCode: 'CRS-0001',
    title: 'New Course',
    description: 'desc',
    status: CourseStatus.DRAFT,
    instructorId: 'i1',
    publishedAt: null,
    createdAt: '2026-08-01T00:00:00',
    updatedAt: '2026-08-01T00:00:00',
  };

  beforeEach(() => {
    instructorCourseApiSpy = jasmine.createSpyObj('InstructorCourseApiService', ['createCourse']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentProfileId: 'i1' });

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CourseCreatePageComponent],
      providers: [
        Title,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: InstructorCourseApiService, useValue: instructorCourseApiSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
      // Template renders app-page-header etc. (Group C shared components) —
      // out of scope for this component's own logic tests.
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(CourseCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('marks all fields touched and makes no API call when title is empty', () => {
    component.form.patchValue({ courseCode: 'CRS-9', title: '', description: '' });

    component.onSubmit();

    expect(component.form.get('title')?.touched).toBe(true);
    expect(instructorCourseApiSpy.createCourse).not.toHaveBeenCalled();
  });

  it('calls createCourse with instructorId from AuthService when valid', () => {
    instructorCourseApiSpy.createCourse.and.returnValue(of(createdCourse));
    component.form.setValue({ courseCode: 'CRS-9', title: 'A Valid Title', description: 'desc' });

    component.onSubmit();

    expect(instructorCourseApiSpy.createCourse).toHaveBeenCalledWith({
      courseCode: 'CRS-9',
      title: 'A Valid Title',
      description: 'desc',
      instructorId: 'i1',
    });
  });

  it('applies field-level server errors from a 400 response and does not navigate', () => {
    instructorCourseApiSpy.createCourse.and.returnValue(
      throwError(() => ({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: ['title: size must be between 3 and 150'],
      })),
    );
    component.form.setValue({ courseCode: 'CRS-9', title: 'A Valid Title', description: 'desc' });

    component.onSubmit();

    expect(component.form.get('title')?.errors).toEqual({ serverError: 'size must be between 3 and 150' });
    expect(component.formErrors).toEqual([]);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('navigates to Course Management and shows a success toast on success', () => {
    instructorCourseApiSpy.createCourse.and.returnValue(of(createdCourse));
    component.form.setValue({ courseCode: 'CRS-9', title: 'A Valid Title', description: 'desc' });

    component.onSubmit();

    expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith('Course created.');
    expect(routerSpy.navigate).toHaveBeenCalledWith([`/${AppRoutes.instructor.courses}`]);
  });

  it('hasUnsavedChanges() reflects form.dirty', () => {
    expect(component.hasUnsavedChanges()).toBe(false);
    component.form.get('title')?.markAsDirty();
    expect(component.hasUnsavedChanges()).toBe(true);
  });
});
