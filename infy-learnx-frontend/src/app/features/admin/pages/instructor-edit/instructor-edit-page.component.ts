import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { InstructorStatus } from '../../../../core/models/instructor.model';
import { ApiError } from '../../../../core/models/api-response.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { AdminUserApiService } from '../../services/admin-user-api.service';

@Component({
  selector: 'app-instructor-edit-page',
  templateUrl: './instructor-edit-page.component.html',
  styleUrls: ['./instructor-edit-page.component.scss'],
})
export class InstructorEditPageComponent implements OnInit, ComponentWithUnsavedChanges {
  private readonly userId = this.route.snapshot.paramMap.get('userId') ?? '';
  private instructorId = '';

  isLoading = true;
  loadError: string | null = null;
  isSubmitting = false;
  formErrors: string[] = [];

  readonly statusOptions = Object.values(InstructorStatus);

  readonly form: FormGroup = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    specialization: ['', Validators.maxLength(255)],
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
    this.titleService.setTitle('Edit Instructor | Infy_LearnX');
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
    const { fullName, email, specialization, status } = this.form.value;
    this.adminUserApiService
      .updateInstructor(this.instructorId, { fullName, email, specialization: specialization || null, status })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.form.markAsPristine();
          this.notificationService.showSuccess('Instructor updated.');
          this.router.navigate([`/${AppRoutes.admin.users}`]);
        },
        error: (error: ApiError) => {
          this.isSubmitting = false;
          if (error?.details) {
            this.formErrors = applyServerErrors(this.form, error.details);
          } else {
            this.notificationService.showError(error?.message ?? 'Unable to update instructor. Please try again.');
          }
        },
      });
  }

  private load(): void {
    this.isLoading = true;
    this.loadError = null;
    forkJoin({
      instructor: this.adminUserApiService.getInstructorByUserId(this.userId),
      user: this.adminUserApiService.getUserById(this.userId),
    }).subscribe({
      next: ({ instructor, user }) => {
        this.instructorId = instructor.instructorId;
        this.form.patchValue({
          fullName: user.fullName,
          email: user.email,
          specialization: instructor.specialization ?? '',
          status: instructor.status,
        });
        this.form.markAsPristine();
        this.isLoading = false;
        this.titleService.setTitle(`Edit ${user.fullName} | Infy_LearnX`);
      },
      error: () => {
        this.loadError = 'Unable to load this instructor. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
