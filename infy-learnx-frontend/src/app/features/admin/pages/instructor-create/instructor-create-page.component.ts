import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { AdminUserApiService } from '../../services/admin-user-api.service';

@Component({
  selector: 'app-instructor-create-page',
  templateUrl: './instructor-create-page.component.html',
  styleUrls: ['./instructor-create-page.component.scss'],
})
export class InstructorCreatePageComponent implements OnInit, ComponentWithUnsavedChanges {
  isSubmitting = false;
  formErrors: string[] = [];

  readonly form: FormGroup = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    specialization: ['', Validators.maxLength(255)],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly adminUserApiService: AdminUserApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Add Instructor | Infy_LearnX');
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
    const { fullName, email, specialization } = this.form.value;
    this.adminUserApiService.createInstructor({ fullName, email, specialization: specialization || null }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.markAsPristine();
        this.notificationService.showSuccess('Instructor added.');
        this.router.navigate([`/${AppRoutes.admin.users}`]);
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        if (error?.details) {
          this.formErrors = applyServerErrors(this.form, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to add instructor. Please try again.');
        }
      },
    });
  }
}
