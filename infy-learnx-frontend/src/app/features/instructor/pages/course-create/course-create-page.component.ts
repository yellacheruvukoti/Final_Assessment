import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { InstructorCourseApiService } from '../../services/instructor-course-api.service';

// SHELL (I-05): title/description fields + UnsavedChangesGuard wiring per
// frontend-tasks.md's split ("structure only; form wiring is in J").
// Submission already targets the real, previously-fixed CreateCourseRequest
// contract (courseCode, title, description, instructorId — no status; new
// courses are always DRAFT server-side) since that shape doesn't change in
// J-02, only validators do (positiveIntegerValidator etc. don't apply
// here — J-02 will add the full L-01 validator set).
@Component({
  selector: 'app-course-create-page',
  templateUrl: './course-create-page.component.html',
  styleUrls: ['./course-create-page.component.scss'],
})
export class CourseCreatePageComponent implements OnInit, ComponentWithUnsavedChanges {
  isSubmitting = false;
  formErrors: string[] = [];

  readonly form: FormGroup = this.formBuilder.group({
    courseCode: ['', [Validators.required, Validators.maxLength(20)]],
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    description: ['', Validators.maxLength(2000)],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly instructorCourseApiService: InstructorCourseApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Create Course | Infy_LearnX');
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  onSubmit(): void {
    this.formErrors = [];
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const instructorId = this.authService.currentProfileId ?? '';
    this.isSubmitting = true;
    const { courseCode, title, description } = this.form.value;
    this.instructorCourseApiService.createCourse({ courseCode, title, description, instructorId }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.markAsPristine();
        this.notificationService.showSuccess('Course created.');
        this.router.navigate([`/${AppRoutes.instructor.courses}`]);
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        if (error?.details) {
          this.formErrors = applyServerErrors(this.form, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to create course. Please try again.');
        }
      },
    });
  }
}
