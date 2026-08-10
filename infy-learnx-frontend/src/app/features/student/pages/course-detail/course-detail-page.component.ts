import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { AssessmentResponse, ScopeType } from '../../../../core/models/assessment.model';
import { CourseResponse } from '../../../../core/models/course.model';
import { LearningMaterialResponse } from '../../../../core/models/material.model';
import { CourseModuleResponse } from '../../../../core/models/module.model';
import { RegistrationStatus } from '../../../../core/models/registration.model';
import { QuizResponse } from '../../../../core/models/quiz.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { CourseApiService } from '../../services/course-api.service';
import { RegistrationApiService } from '../../services/registration-api.service';

type CourseDetailTab = 'overview' | 'materials' | 'quizzes' | 'assessment';

interface ModuleGroup {
  module: CourseModuleResponse;
  materials: LearningMaterialResponse[];
}

interface CourseAssessmentRow {
  assessment: AssessmentResponse;
  isRegistered: boolean;
  isRegistering: boolean;
}

@Component({
  selector: 'app-course-detail-page',
  templateUrl: './course-detail-page.component.html',
  styleUrls: ['./course-detail-page.component.scss'],
})
export class CourseDetailPageComponent implements OnInit {
  private readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';
  private readonly studentId = this.authService.currentProfileId ?? '';

  activeTab: CourseDetailTab = 'overview';

  course: CourseResponse | null = null;
  isLoadingCourse = true;
  courseError: string | null = null;

  isEnrolled: boolean | null = null;
  isEnrolling = false;

  moduleGroups: ModuleGroup[] = [];
  isLoadingMaterials = false;
  materialsError: string | null = null;
  private materialsLoaded = false;
  private readonly expandedModuleIds = new Set<string>();

  quizzes: QuizResponse[] = [];
  isLoadingQuizzes = false;
  quizzesError: string | null = null;
  private quizzesLoaded = false;

  courseAssessments: CourseAssessmentRow[] = [];
  isLoadingAssessment = false;
  assessmentError: string | null = null;
  private assessmentLoaded = false;

  constructor(
    private readonly courseApiService: CourseApiService,
    private readonly assessmentApiService: AssessmentApiService,
    private readonly registrationApiService: RegistrationApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCourse();
    this.loadEnrollmentStatus();
  }

  get totalModules(): number {
    return this.moduleGroups.length;
  }

  get startLearningRoute(): string {
    return '/' + AppRoutes.student.courseMaterials(this.courseId);
  }

  assessmentQuizzesRoute(assessmentId: string): string {
    return '/' + AppRoutes.student.assessmentQuizzes(assessmentId);
  }

  selectTab(tab: CourseDetailTab): void {
    this.activeTab = tab;
    if (tab === 'materials' && !this.materialsLoaded) {
      this.loadMaterials();
    }
    if (tab === 'quizzes' && !this.quizzesLoaded) {
      this.loadQuizzes();
    }
    if (tab === 'assessment' && !this.assessmentLoaded) {
      this.loadCourseAssessments();
    }
  }

  toggleModule(moduleId: string): void {
    if (this.expandedModuleIds.has(moduleId)) {
      this.expandedModuleIds.delete(moduleId);
    } else {
      this.expandedModuleIds.add(moduleId);
    }
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModuleIds.has(moduleId);
  }

  retryCourse(): void {
    this.loadCourse();
  }

  retryMaterials(): void {
    this.loadMaterials();
  }

  retryQuizzes(): void {
    this.loadQuizzes();
  }

  retryAssessment(): void {
    this.loadCourseAssessments();
  }

  registerForAssessment(row: CourseAssessmentRow): void {
    row.isRegistering = true;
    this.registrationApiService
      .registerForAssessment({ studentId: this.studentId, assessmentId: row.assessment.assessmentId })
      .subscribe({
        next: () => {
          row.isRegistering = false;
          row.isRegistered = true;
          this.notificationService.showSuccess('Registered for the course assessment.');
        },
        error: (error: { message?: string }) => {
          row.isRegistering = false;
          this.notificationService.showError(
            error?.message ?? 'Unable to register for this assessment. Please try again.',
          );
        },
      });
  }

  register(): void {
    if (!this.studentId || this.isEnrolling) {
      return;
    }
    this.isEnrolling = true;
    this.courseApiService.enrollInCourse(this.courseId, this.studentId).subscribe({
      next: () => {
        this.isEnrolled = true;
        this.isEnrolling = false;
        this.materialsLoaded = false;
        this.notificationService.showSuccess('You are now registered for this course.');
        if (this.activeTab === 'materials') {
          this.loadMaterials();
        }
      },
      error: () => {
        this.isEnrolling = false;
        this.notificationService.showError('Unable to register for this course. Please try again.');
      },
    });
  }

  startLearning(): void {
    this.router.navigateByUrl(this.startLearningRoute);
  }

  private loadCourse(): void {
    this.isLoadingCourse = true;
    this.courseError = null;
    this.courseApiService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.isLoadingCourse = false;
        this.titleService.setTitle(`${course.title} | Infy_LearnX`);
      },
      error: () => {
        this.courseError = 'Unable to load this course. Please try again.';
        this.isLoadingCourse = false;
      },
    });
  }

  private loadMaterials(): void {
    this.isLoadingMaterials = true;
    this.materialsError = null;
    this.courseApiService.getCourseModules(this.courseId).subscribe({
      next: (modules) => {
        const orderedModules = [...modules].sort((a, b) => a.moduleOrder - b.moduleOrder);
        this.courseApiService.getCourseMaterials(this.courseId).subscribe({
          next: (materials) => {
            this.moduleGroups = orderedModules.map((module) => ({
              module,
              materials: materials.filter((material) => material.moduleId === module.moduleId),
            }));
            this.materialsLoaded = true;
            this.isLoadingMaterials = false;
          },
          error: (error: { code?: string }) => this.handleMaterialsError(error),
        });
      },
      error: (error: { code?: string }) => this.handleMaterialsError(error),
    });
  }

  private handleMaterialsError(error: { code?: string }): void {
    this.materialsError =
      error?.code === 'COURSE_ACCESS_DENIED' || error?.code === 'COURSE_NOT_ENROLLED'
        ? 'You must be registered for this course to view its content.'
        : 'Unable to load course content. Please try again.';
    this.isLoadingMaterials = false;
  }

  private loadQuizzes(): void {
    this.isLoadingQuizzes = true;
    this.quizzesError = null;
    this.courseApiService.getCourseQuizzes(this.courseId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.quizzesLoaded = true;
        this.isLoadingQuizzes = false;
      },
      error: () => {
        this.quizzesError = 'Unable to load quizzes. Please try again.';
        this.isLoadingQuizzes = false;
      },
    });
  }

  // Course Assessment section (requirement 22): finds the assessment(s)
  // scoped to this course and cross-references the student's existing
  // registrations — the same register/take-quizzes flow used on the Batch
  // Assessment tab, just filtered to this one course.
  private loadCourseAssessments(): void {
    this.isLoadingAssessment = true;
    this.assessmentError = null;
    this.assessmentApiService.getAssessments().subscribe({
      next: (assessments) => {
        const courseAssessments = assessments.filter(
          (a) => a.scopeType === ScopeType.COURSE && a.scopeId === this.courseId,
        );
        if (courseAssessments.length === 0) {
          this.courseAssessments = [];
          this.assessmentLoaded = true;
          this.isLoadingAssessment = false;
          return;
        }
        this.registrationApiService.getStudentRegistrations(this.studentId).subscribe({
          next: (registrations) => {
            const registeredIds = new Set(
              registrations.filter((r) => r.status === RegistrationStatus.REGISTERED).map((r) => r.assessmentId),
            );
            this.courseAssessments = courseAssessments.map((assessment) => ({
              assessment,
              isRegistered: registeredIds.has(assessment.assessmentId),
              isRegistering: false,
            }));
            this.assessmentLoaded = true;
            this.isLoadingAssessment = false;
          },
          error: () => {
            this.assessmentError = 'Unable to load your assessment registrations. Please try again.';
            this.isLoadingAssessment = false;
          },
        });
      },
      error: () => {
        this.assessmentError = 'Unable to load the course assessment. Please try again.';
        this.isLoadingAssessment = false;
      },
    });
  }

  private loadEnrollmentStatus(): void {
    this.courseApiService.getEnrollmentsForStudent(this.studentId).subscribe({
      next: (enrollments) => {
        this.isEnrolled = enrollments.some((enrollment) => enrollment.courseId === this.courseId);
      },
      error: () => {
        this.isEnrolled = null;
      },
    });
  }
}
