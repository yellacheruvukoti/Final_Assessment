import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { CourseProgressGroup } from '../../components/course-progress-row/course-progress-row.component';
import { CourseApiService } from '../../services/course-api.service';

@Component({
  selector: 'app-my-progress-page',
  templateUrl: './my-progress-page.component.html',
  styleUrls: ['./my-progress-page.component.scss'],
})
export class MyProgressPageComponent implements OnInit {
  private readonly studentId = this.authService.currentProfileId ?? '';

  isLoading = true;
  hasError = false;
  groups: CourseProgressGroup[] = [];
  private readonly expandedCourseIds = new Set<string>();

  constructor(
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly courseApiService: CourseApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('My Progress | Infy_LearnX');
    this.load();
  }

  retry(): void {
    this.load();
  }

  isExpanded(courseId: string): boolean {
    return this.expandedCourseIds.has(courseId);
  }

  toggleExpand(courseId: string): void {
    if (this.expandedCourseIds.has(courseId)) {
      this.expandedCourseIds.delete(courseId);
    } else {
      this.expandedCourseIds.add(courseId);
    }
  }

  private load(): void {
    this.isLoading = true;
    this.hasError = false;
    this.groups = [];

    this.courseApiService
      .getEnrollmentsForStudent(this.studentId)
      .pipe(
        switchMap((enrollments) => {
          if (enrollments.length === 0) {
            return of([] as CourseProgressGroup[]);
          }
          return forkJoin(
            enrollments.map((enrollment) =>
              forkJoin({
                course: this.courseApiService.getCourseById(enrollment.courseId),
                progress: this.courseApiService.getCourseProgress(enrollment.courseId, this.studentId),
              }).pipe(
                map(({ course, progress }) => {
                  const courseLevelRow = progress.find((row) => row.moduleId === null);
                  const overallPercentage =
                    courseLevelRow?.completionPercentage ??
                    (progress.length > 0
                      ? Math.round(
                          progress.reduce((sum, row) => sum + row.completionPercentage, 0) / progress.length,
                        )
                      : 0);
                  const group: CourseProgressGroup = {
                    courseId: enrollment.courseId,
                    courseTitle: course.title,
                    overallPercentage,
                    moduleProgress: progress,
                  };
                  return group;
                }),
                // One course's data failing to load shouldn't blank out the
                // whole page — degrade that row instead of failing the
                // outer forkJoin for every enrollment.
                catchError(() =>
                  of<CourseProgressGroup>({
                    courseId: enrollment.courseId,
                    courseTitle: 'Unknown course',
                    overallPercentage: 0,
                    moduleProgress: [],
                  }),
                ),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (groups) => {
          this.groups = groups;
          this.isLoading = false;
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        },
      });
  }
}
