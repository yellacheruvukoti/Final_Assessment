import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CourseResponse } from '../../../../core/models/course.model';
import { LearningMaterialResponse } from '../../../../core/models/material.model';
import { QuizResponse } from '../../../../core/models/quiz.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseApiService } from '../../services/course-api.service';

type CourseDetailTab = 'overview' | 'materials' | 'quizzes';

interface MaterialGroup {
  moduleId: string;
  materials: LearningMaterialResponse[];
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

  materialGroups: MaterialGroup[] = [];
  isLoadingMaterials = false;
  materialsError: string | null = null;
  private materialsLoaded = false;
  private readonly expandedModuleIds = new Set<string>();

  quizzes: QuizResponse[] = [];
  isLoadingQuizzes = false;
  quizzesError: string | null = null;
  private quizzesLoaded = false;

  constructor(
    private readonly courseApiService: CourseApiService,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadCourse();
    this.loadEnrollmentStatus();
  }

  selectTab(tab: CourseDetailTab): void {
    this.activeTab = tab;
    if (tab === 'materials' && !this.materialsLoaded) {
      this.loadMaterials();
    }
    if (tab === 'quizzes' && !this.quizzesLoaded) {
      this.loadQuizzes();
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
    this.courseApiService.getCourseMaterials(this.courseId).subscribe({
      next: (materials) => {
        this.materialGroups = this.groupByModule(materials);
        this.materialsLoaded = true;
        this.isLoadingMaterials = false;
      },
      error: (error: { code?: string }) => {
        this.materialsError =
          error?.code === 'COURSE_ACCESS_DENIED' || error?.code === 'COURSE_NOT_ENROLLED'
            ? 'You must be enrolled in this course to access learning materials.'
            : 'Unable to load materials. Please try again.';
        this.isLoadingMaterials = false;
      },
    });
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

  private groupByModule(materials: LearningMaterialResponse[]): MaterialGroup[] {
    const map = new Map<string, LearningMaterialResponse[]>();
    for (const material of materials) {
      const list = map.get(material.moduleId) ?? [];
      list.push(material);
      map.set(material.moduleId, list);
    }
    return Array.from(map.entries()).map(([moduleId, mats]) => ({ moduleId, materials: mats }));
  }
}
