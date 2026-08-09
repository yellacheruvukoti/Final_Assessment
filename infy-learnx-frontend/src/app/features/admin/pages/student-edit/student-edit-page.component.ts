import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { catchError, forkJoin, of } from 'rxjs';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { BatchResponse } from '../../../../core/models/batch.model';
import { UserStatus } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { AdminUserApiService } from '../../services/admin-user-api.service';

@Component({
  selector: 'app-student-edit-page',
  templateUrl: './student-edit-page.component.html',
  styleUrls: ['./student-edit-page.component.scss'],
})
export class StudentEditPageComponent implements OnInit, ComponentWithUnsavedChanges {
  private readonly userId = this.route.snapshot.paramMap.get('userId') ?? '';
  private studentId = '';

  isLoading = true;
  loadError: string | null = null;
  isSubmitting = false;
  formErrors: string[] = [];

  batches: BatchResponse[] = [];
  readonly statusOptions = Object.values(UserStatus);

  readonly form: FormGroup = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    batchId: [''],
    status: ['', Validators.required],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly adminUserApiService: AdminUserApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Edit Student | Infy_LearnX');
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
    const { fullName, email, batchId, status } = this.form.value;
    this.adminUserApiService
      .updateStudent(this.studentId, { fullName, email, batchId: batchId || null, status })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.form.markAsPristine();
          this.notificationService.showSuccess('Student updated.');
          this.router.navigate([`/${AppRoutes.admin.users}`]);
        },
        error: (error: ApiError) => {
          this.isSubmitting = false;
          if (error?.details) {
            this.formErrors = applyServerErrors(this.form, error.details);
          } else {
            this.notificationService.showError(error?.message ?? 'Unable to update student. Please try again.');
          }
        },
      });
  }

  private load(): void {
    this.isLoading = true;
    this.loadError = null;
    forkJoin({
      student: this.adminUserApiService.getStudentByUserId(this.userId),
      user: this.adminUserApiService.getUserById(this.userId),
      // Non-critical: the batch dropdown degrades to empty rather than
      // blocking the whole form if this one call fails.
      batches: this.adminUserApiService.getBatches().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ student, user, batches }) => {
        this.studentId = student.studentId;
        this.batches = batches;
        this.form.patchValue({
          fullName: user.fullName,
          email: user.email,
          batchId: student.batchId ?? '',
          status: user.status,
        });
        this.form.markAsPristine();
        this.isLoading = false;
        this.titleService.setTitle(`Edit ${user.fullName} | Infy_LearnX`);
      },
      error: () => {
        this.loadError = 'Unable to load this student. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
