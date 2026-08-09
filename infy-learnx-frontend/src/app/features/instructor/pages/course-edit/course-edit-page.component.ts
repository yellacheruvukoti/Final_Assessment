import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { CourseStatus } from '../../../../core/models/course.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { InstructorCourseApiService } from '../../services/instructor-course-api.service';

// SHELL (I-05) — see CourseCreatePageComponent's doc comment for the split
// rationale. UpdateCourseRequest's real shape (title, description, status)
// is already wired; J-02 adds the full L-01 validator set.
@Component({
  selector: 'app-course-edit-page',
  templateUrl: './course-edit-page.component.html',
  styleUrls: ['./course-edit-page.component.scss'],
})
export class CourseEditPageComponent implements OnInit, ComponentWithUnsavedChanges {
  private readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

  isLoading = true;
  loadError: string | null = null;
  isSubmitting = false;
  formErrors: string[] = [];

  readonly statusOptions = Object.values(CourseStatus);

  readonly form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    description: ['', Validators.maxLength(2000)],
    status: ['', Validators.required],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly instructorCourseApiService: InstructorCourseApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  retry(): void {
    this.load();
  }

  onSubmit(): void {
    this.formErrors = [];
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.instructorCourseApiService.updateCourse(this.courseId, this.form.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.markAsPristine();
        this.notificationService.showSuccess('Course updated.');
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        if (error?.details) {
          this.formErrors = applyServerErrors(this.form, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to update course. Please try again.');
        }
      },
    });
  }

  private load(): void {
    this.isLoading = true;
    this.loadError = null;
    this.instructorCourseApiService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.form.patchValue({ title: course.title, description: course.description, status: course.status });
        this.form.markAsPristine();
        this.isLoading = false;
        this.titleService.setTitle(`Edit ${course.title} | Infy_LearnX`);
      },
      error: () => {
        this.loadError = 'Unable to load this course. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
