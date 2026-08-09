import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { ApiError } from '../../../../core/models/api-response.model';
import { CourseModuleResponse } from '../../../../core/models/module.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { positiveIntegerValidator } from '../../../../shared/validators/positive-integer.validator';
import { InstructorCourseApiService } from '../../services/instructor-course-api.service';
import { ModuleCacheService } from '../../services/module-cache.service';

// KNOWN BACKEND GAP: see ModuleCacheService's doc comment — there is no
// GET endpoint to list a course's existing modules, so `modules` below can
// only ever reflect what this browser session has added via the working
// POST endpoint.
@Component({
  selector: 'app-module-management-page',
  templateUrl: './module-management-page.component.html',
  styleUrls: ['./module-management-page.component.scss'],
})
export class ModuleManagementPageComponent implements OnInit {
  private readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

  courseTitle = '';
  isLoadingCourse = true;
  courseError: string | null = null;

  modules: CourseModuleResponse[] = [];
  isSubmitting = false;
  formErrors: string[] = [];

  readonly form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    moduleOrder: [null, [Validators.required, positiveIntegerValidator]],
  });

  readonly contentUploadRoute = () => `/${AppRoutes.instructor.contentUpload(this.courseId)}`;

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
    const { title, moduleOrder } = this.form.value;
    this.instructorCourseApiService.createModule(this.courseId, { title, moduleOrder }).subscribe({
      next: (module) => {
        this.moduleCacheService.addModule(this.courseId, module);
        this.modules = this.moduleCacheService.getModules(this.courseId);
        this.isSubmitting = false;
        this.form.reset();
        this.notificationService.showSuccess('Module added.');
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        if (error?.details) {
          this.formErrors = applyServerErrors(this.form, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to add module. Please try again.');
        }
      },
    });
  }

  onCancel(): void {
    this.formErrors = [];
    this.form.reset();
  }

  private loadCourse(): void {
    this.isLoadingCourse = true;
    this.courseError = null;
    this.instructorCourseApiService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.courseTitle = course.title;
        this.isLoadingCourse = false;
        this.titleService.setTitle(`Modules – ${course.title} | Infy_LearnX`);
      },
      error: () => {
        this.courseError = 'Unable to load this course. Please try again.';
        this.isLoadingCourse = false;
      },
    });
  }
}
