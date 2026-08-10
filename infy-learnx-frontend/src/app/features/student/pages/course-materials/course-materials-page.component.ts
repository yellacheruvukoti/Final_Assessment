import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { LearningMaterialResponse } from '../../../../core/models/material.model';
import { CourseModuleResponse } from '../../../../core/models/module.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CourseApiService } from '../../services/course-api.service';

interface ModuleGroup {
  module: CourseModuleResponse;
  materials: LearningMaterialResponse[];
}

// The "Start Learning" experience: left-side module/lesson navigation, main
// lesson viewer, and Mark Complete / Previous / Next actions wired to the
// real course-modules, course-materials and lesson-completion endpoints.
@Component({
  selector: 'app-course-materials-page',
  templateUrl: './course-materials-page.component.html',
  styleUrls: ['./course-materials-page.component.scss'],
})
export class CourseMaterialsPageComponent implements OnInit {
  private readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';
  private readonly studentId = this.authService.currentProfileId ?? '';

  courseTitle = '';
  moduleGroups: ModuleGroup[] = [];
  flatLessons: LearningMaterialResponse[] = [];
  selectedMaterialId: string | null = null;

  isLoading = true;
  accessDeniedMessage: string | null = null;
  errorMessage: string | null = null;
  isMarkingComplete = false;

  courseProgressPercentage = 0;
  private readonly expandedModuleIds = new Set<string>();

  constructor(
    private readonly courseApiService: CourseApiService,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Learning | Infy_LearnX');
    this.loadCourseTitle();
    this.loadModulesAndMaterials();
    this.loadProgress();
  }

  get selectedMaterial(): LearningMaterialResponse | null {
    return this.flatLessons.find((lesson) => lesson.materialId === this.selectedMaterialId) ?? null;
  }

  get selectedModuleTitle(): string {
    const material = this.selectedMaterial;
    if (!material) {
      return '';
    }
    return this.moduleGroups.find((g) => g.module.moduleId === material.moduleId)?.module.title ?? '';
  }

  get selectedIndex(): number {
    return this.flatLessons.findIndex((lesson) => lesson.materialId === this.selectedMaterialId);
  }

  get hasPrevious(): boolean {
    return this.selectedIndex > 0;
  }

  get hasNext(): boolean {
    return this.selectedIndex >= 0 && this.selectedIndex < this.flatLessons.length - 1;
  }

  retry(): void {
    this.loadModulesAndMaterials();
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModuleIds.has(moduleId);
  }

  toggleModule(moduleId: string): void {
    if (this.expandedModuleIds.has(moduleId)) {
      this.expandedModuleIds.delete(moduleId);
    } else {
      this.expandedModuleIds.add(moduleId);
    }
  }

  selectLesson(material: LearningMaterialResponse): void {
    this.selectedMaterialId = material.materialId;
    this.expandedModuleIds.add(material.moduleId);
  }

  previousLesson(): void {
    if (this.hasPrevious) {
      this.selectLesson(this.flatLessons[this.selectedIndex - 1]);
    }
  }

  nextLesson(): void {
    if (this.hasNext) {
      this.selectLesson(this.flatLessons[this.selectedIndex + 1]);
    }
  }

  markComplete(): void {
    const material = this.selectedMaterial;
    if (!material || this.isMarkingComplete) {
      return;
    }
    this.isMarkingComplete = true;
    this.courseApiService.markLessonComplete(this.courseId, material.materialId).subscribe({
      next: () => {
        this.isMarkingComplete = false;
        this.notificationService.showSuccess('Lesson marked as complete.');
        this.loadProgress();
      },
      error: () => {
        this.isMarkingComplete = false;
        this.notificationService.showError('Unable to mark this lesson complete. Please try again.');
      },
    });
  }

  private loadCourseTitle(): void {
    this.courseApiService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.courseTitle = course.title;
        this.titleService.setTitle(`Learning – ${course.title} | Infy_LearnX`);
      },
    });
  }

  private loadProgress(): void {
    if (!this.studentId) {
      return;
    }
    this.courseApiService.getCourseProgress(this.courseId, this.studentId).subscribe({
      next: (rows) => {
        const courseRow = rows.find((row) => row.moduleId === null);
        this.courseProgressPercentage = courseRow ? courseRow.completionPercentage : 0;
      },
      error: () => {
        this.courseProgressPercentage = 0;
      },
    });
  }

  private loadModulesAndMaterials(): void {
    this.isLoading = true;
    this.accessDeniedMessage = null;
    this.errorMessage = null;

    this.courseApiService.getCourseModules(this.courseId).subscribe({
      next: (modules) => {
        const orderedModules = [...modules].sort((a, b) => a.moduleOrder - b.moduleOrder);
        this.courseApiService.getCourseMaterials(this.courseId).subscribe({
          next: (materials) => {
            this.moduleGroups = orderedModules.map((module) => ({
              module,
              materials: materials.filter((material) => material.moduleId === module.moduleId),
            }));
            this.flatLessons = this.moduleGroups.flatMap((group) => group.materials);
            if (this.flatLessons.length > 0) {
              this.selectLesson(this.flatLessons[0]);
            }
            this.isLoading = false;
          },
          error: (error: { code?: string }) => this.handleError(error),
        });
      },
      error: (error: { code?: string }) => this.handleError(error),
    });
  }

  private handleError(error: { code?: string }): void {
    this.isLoading = false;
    if (error?.code === 'COURSE_ACCESS_DENIED' || error?.code === 'COURSE_NOT_ENROLLED') {
      this.accessDeniedMessage = 'You must be registered for this course to access learning materials.';
    } else {
      this.errorMessage = 'Unable to load materials. Please try again.';
    }
  }
}
