import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { AccessLevel, MaterialType } from '../../../../core/models/material.model';
import { CourseModuleResponse } from '../../../../core/models/module.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { InstructorCourseApiService } from '../../services/instructor-course-api.service';
import { ModuleCacheService } from '../../services/module-cache.service';

// Module dropdown source: see ModuleCacheService's doc comment — there is
// no GET endpoint to list a course's modules, so this dropdown can only be
// pre-populated with modules added earlier in this same browser session
// (via Module Management). If none have been added yet, the dropdown is
// honestly empty rather than showing fabricated options; the required
// validator on moduleId then correctly blocks submission until the
// instructor adds a module first.
@Component({
  selector: 'app-content-upload-page',
  templateUrl: './content-upload-page.component.html',
  styleUrls: ['./content-upload-page.component.scss'],
})
export class ContentUploadPageComponent implements OnInit, ComponentWithUnsavedChanges {
  private readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

  courseTitle = '';
  isLoadingCourse = true;
  courseError: string | null = null;

  modules: CourseModuleResponse[] = [];
  isSubmitting = false;
  formErrors: string[] = [];

  readonly materialTypeOptions = Object.values(MaterialType);
  readonly accessLevelOptions = Object.values(AccessLevel);

  readonly form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    materialType: ['', Validators.required],
    resourcePath: ['', Validators.required],
    accessLevel: ['', Validators.required],
    moduleId: ['', Validators.required],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly instructorCourseApiService: InstructorCourseApiService,
    private readonly moduleCacheService: ModuleCacheService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.modules = this.moduleCacheService.getModules(this.courseId);
    this.loadCourse();
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  retryCourse(): void {
    this.loadCourse();
  }

  onSubmit(): void {
    this.formErrors = [];
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const { title, materialType, resourcePath, accessLevel, moduleId } = this.form.value;
    this.instructorCourseApiService
      .createMaterial(this.courseId, { title, materialType, resourcePath, accessLevel, moduleId })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.form.reset();
          this.notificationService.showSuccess('Material added.');
        },
        error: (error: ApiError) => {
          this.isSubmitting = false;
          if (error?.details) {
            this.formErrors = applyServerErrors(this.form, error.details);
          } else {
            this.notificationService.showError(error?.message ?? 'Unable to add material. Please try again.');
          }
        },
      });
  }

  private loadCourse(): void {
    this.isLoadingCourse = true;
    this.courseError = null;
    this.instructorCourseApiService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.courseTitle = course.title;
        this.isLoadingCourse = false;
        this.titleService.setTitle(`Materials – ${course.title} | Infy_LearnX`);
      },
      error: () => {
        this.courseError = 'Unable to load this course. Please try again.';
        this.isLoadingCourse = false;
      },
    });
  }
}
