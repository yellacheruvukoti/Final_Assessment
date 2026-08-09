import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { AssessmentStatus, ScopeType } from '../../../../core/models/assessment.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { endAfterStartValidator } from '../../../../shared/validators/end-after-start.validator';
import { positiveIntegerValidator } from '../../../../shared/validators/positive-integer.validator';
import { CourseFilterOption } from '../../components/performance-filters/performance-filters.component';
import { InstructorAssessmentApiService } from '../../services/instructor-assessment-api.service';
import { InstructorPerformanceApiService } from '../../services/instructor-performance-api.service';

// CreateAssessmentRequest's real shape (assessmentCode required, unlike
// frontend-tasks.md E-02's literal description) is already wired.
//
// Scope Reference dropdown: COURSE resolves to the instructor's owned
// courses via the same GET /api/instructors/{id}/performance pattern used
// by CourseManagementPageComponent (the only endpoint that returns the
// full owned-course set, drafts included). BATCH has no equivalent —
// BatchController only exposes GET /api/batches/{id} (must already know
// the id), no "list my batches" endpoint exists anywhere — so BATCH scope
// keeps a manual text input rather than a fake dropdown.
@Component({
  selector: 'app-assessment-create-page',
  templateUrl: './assessment-create-page.component.html',
  styleUrls: ['./assessment-create-page.component.scss'],
})
export class AssessmentCreatePageComponent implements OnInit, ComponentWithUnsavedChanges {
  isSubmitting = false;
  formErrors: string[] = [];

  courseOptions: CourseFilterOption[] = [];
  isLoadingCourses = false;
  coursesError: string | null = null;

  readonly statusOptions = Object.values(AssessmentStatus);
  readonly scopeTypeOptions = Object.values(ScopeType);
  readonly ScopeType = ScopeType;

  readonly form: FormGroup = this.formBuilder.group(
    {
      assessmentCode: ['', [Validators.required, Validators.maxLength(20)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', Validators.maxLength(1000)],
      status: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      durationMinutes: [null, [Validators.required, positiveIntegerValidator]],
      scopeType: ['', Validators.required],
      scopeId: ['', Validators.required],
    },
    { validators: endAfterStartValidator },
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly instructorAssessmentApiService: InstructorAssessmentApiService,
    private readonly instructorPerformanceApiService: InstructorPerformanceApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Create Assessment | Infy_LearnX');
    this.form.get('scopeType')?.valueChanges.subscribe((scopeType: ScopeType | '') => {
      this.form.get('scopeId')?.setValue('');
      if (scopeType === ScopeType.COURSE && this.courseOptions.length === 0 && !this.isLoadingCourses) {
        this.loadCourseOptions();
      }
    });
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
    this.isSubmitting = true;
    this.instructorAssessmentApiService.createAssessment(this.form.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.markAsPristine();
        this.notificationService.showSuccess('Assessment created.');
        this.router.navigate([`/${AppRoutes.instructor.assessments}`]);
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        if (error?.details) {
          this.formErrors = applyServerErrors(this.form, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to create assessment. Please try again.');
        }
      },
    });
  }

  private loadCourseOptions(): void {
    const instructorId = this.authService.currentProfileId ?? '';
    this.isLoadingCourses = true;
    this.coursesError = null;
    this.instructorPerformanceApiService.getPerformance(instructorId).subscribe({
      next: (performance) => {
        this.courseOptions = performance.courses.map((c) => ({ courseId: c.courseId, title: c.title }));
        this.isLoadingCourses = false;
      },
      error: () => {
        this.coursesError = 'Unable to load your courses. Please try again.';
        this.isLoadingCourses = false;
      },
    });
  }
}
