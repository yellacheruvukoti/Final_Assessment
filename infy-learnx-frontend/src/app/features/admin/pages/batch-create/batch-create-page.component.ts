import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { UserRole } from '../../../../core/constants/role.constants';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { UserResponse } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { AdminUserApiService } from '../../services/admin-user-api.service';

// Batches are real DB records (user-service Batch entity), not a frontend
// dropdown — this page is how Admin adds new ones (e.g. "Cloud",
// "Data Science") beyond the initial Java/BigData/AI seed rows, so they
// automatically appear in every batch picker (student batch selection,
// instructor batch-assessment scope) with no frontend change required.
@Component({
  selector: 'app-batch-create-page',
  templateUrl: './batch-create-page.component.html',
  styleUrls: ['./batch-create-page.component.scss'],
})
export class BatchCreatePageComponent implements OnInit, ComponentWithUnsavedChanges {
  isSubmitting = false;
  formErrors: string[] = [];

  instructors: UserResponse[] = [];
  isLoadingInstructors = true;

  readonly form: FormGroup = this.formBuilder.group({
    batchCode: ['', [Validators.required, Validators.maxLength(30)]],
    batchName: ['', [Validators.required, Validators.maxLength(100)]],
    ownerId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: [''],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly adminUserApiService: AdminUserApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Add Batch | Infy_LearnX');
    this.adminUserApiService.getUsers({ role: UserRole.INSTRUCTOR }).subscribe({
      next: (instructors) => {
        this.instructors = instructors;
        this.isLoadingInstructors = false;
      },
      error: () => {
        this.isLoadingInstructors = false;
      },
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
    const { batchCode, batchName, ownerId, startDate, endDate } = this.form.value;
    this.adminUserApiService.createBatch({ batchCode, batchName, ownerId, startDate, endDate: endDate || null }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.markAsPristine();
        this.notificationService.showSuccess('Batch added.');
        this.router.navigate([`/${AppRoutes.admin.users}`]);
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        if (error?.details) {
          this.formErrors = applyServerErrors(this.form, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to add batch. Please try again.');
        }
      },
    });
  }
}
