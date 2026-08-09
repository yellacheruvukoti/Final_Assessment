import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { AssessmentStatus } from '../../../../core/models/assessment.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { endAfterStartValidator } from '../../../../shared/validators/end-after-start.validator';
import { positiveIntegerValidator } from '../../../../shared/validators/positive-integer.validator';
import { InstructorAssessmentApiService } from '../../services/instructor-assessment-api.service';

// UpdateAssessmentRequest's real shape has no scopeType/scopeId (scope
// cannot be changed after creation), so this form intentionally has no
// scope fields at all — see AssessmentCreatePageComponent's doc comment.
@Component({
  selector: 'app-assessment-edit-page',
  templateUrl: './assessment-edit-page.component.html',
  styleUrls: ['./assessment-edit-page.component.scss'],
})
export class AssessmentEditPageComponent implements OnInit, ComponentWithUnsavedChanges {
  private readonly assessmentId = this.route.snapshot.paramMap.get('assessmentId') ?? '';

  isLoading = true;
  loadError: string | null = null;
  isSubmitting = false;
  formErrors: string[] = [];

  readonly statusOptions = Object.values(AssessmentStatus);

  readonly form: FormGroup = this.formBuilder.group(
    {
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', Validators.maxLength(1000)],
      status: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      durationMinutes: [null, [Validators.required, positiveIntegerValidator]],
    },
    { validators: endAfterStartValidator },
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly instructorAssessmentApiService: InstructorAssessmentApiService,
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
    this.instructorAssessmentApiService.updateAssessment(this.assessmentId, this.form.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.markAsPristine();
        this.notificationService.showSuccess('Assessment updated.');
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        if (error?.details) {
          this.formErrors = applyServerErrors(this.form, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to update assessment. Please try again.');
        }
      },
    });
  }

  private load(): void {
    this.isLoading = true;
    this.loadError = null;
    this.instructorAssessmentApiService.getAssessmentById(this.assessmentId).subscribe({
      next: (assessment) => {
        this.form.patchValue({
          title: assessment.title,
          description: assessment.description,
          status: assessment.status,
          startTime: assessment.startTime,
          endTime: assessment.endTime,
          durationMinutes: assessment.durationMinutes,
        });
        this.form.markAsPristine();
        this.isLoading = false;
        this.titleService.setTitle(`Edit ${assessment.title} | Infy_LearnX`);
      },
      error: () => {
        this.loadError = 'Unable to load this assessment. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
