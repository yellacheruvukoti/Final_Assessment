import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { LearningMaterialResponse } from '../../../../core/models/material.model';
import { CourseApiService } from '../../services/course-api.service';

interface MaterialGroup {
  moduleId: string;
  materials: LearningMaterialResponse[];
}

@Component({
  selector: 'app-course-materials-page',
  templateUrl: './course-materials-page.component.html',
  styleUrls: ['./course-materials-page.component.scss'],
})
export class CourseMaterialsPageComponent implements OnInit {
  private readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

  courseTitle = '';
  materialGroups: MaterialGroup[] = [];
  isLoading = true;
  accessDeniedMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private readonly courseApiService: CourseApiService,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Materials | Infy_LearnX');
    this.loadCourseTitle();
    this.loadMaterials();
  }

  retry(): void {
    this.loadMaterials();
  }

  private loadCourseTitle(): void {
    this.courseApiService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.courseTitle = course.title;
        this.titleService.setTitle(`Materials – ${course.title} | Infy_LearnX`);
      },
    });
  }

  private loadMaterials(): void {
    this.isLoading = true;
    this.accessDeniedMessage = null;
    this.errorMessage = null;

    this.courseApiService.getCourseMaterials(this.courseId).subscribe({
      next: (materials) => {
        this.materialGroups = this.groupByModule(materials);
        this.isLoading = false;
      },
      error: (error: { code?: string }) => {
        this.isLoading = false;
        if (error?.code === 'COURSE_ACCESS_DENIED' || error?.code === 'COURSE_NOT_ENROLLED') {
          this.accessDeniedMessage = 'You must be enrolled in this course to access learning materials.';
        } else {
          this.errorMessage = 'Unable to load materials. Please try again.';
        }
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
