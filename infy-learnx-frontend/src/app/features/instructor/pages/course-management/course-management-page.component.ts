import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { CourseResponse, CourseStatus } from '../../../../core/models/course.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DataTableColumn, SortState } from '../../../../shared/components/data-table/data-table.component';
import { InstructorCourseApiService } from '../../services/instructor-course-api.service';
import { InstructorPerformanceApiService } from '../../services/instructor-performance-api.service';

// KNOWN BACKEND GAP, WORKED AROUND WITH REAL DATA: GET /api/courses is
// hardcoded server-side to courseRepository.findByStatus(PUBLISHED) — it
// can never return an instructor's DRAFT/ARCHIVED courses, for anyone,
// regardless of headers or query params (verified against CourseService
// source, not just live behavior). A "Course Management" page built on
// that endpoint would silently hide every unpublished course the
// instructor owns.
//
// GET /api/instructors/{id}/performance, by contrast, is backed by
// courseRepository.findByInstructorId(instructorId) with no status filter
// at all — it is the only endpoint that returns the instructor's complete
// owned-course id set. This page uses it purely as an id source, then
// fetches full CourseResponse detail per id (GET /api/courses/{id}, which
// has no ownership/status restriction) to get the fields the table needs
// (courseCode, status, createdAt). This is real data via an extra round
// trip, not a fabricated one.
@Component({
  selector: 'app-course-management-page',
  templateUrl: './course-management-page.component.html',
  styleUrls: ['./course-management-page.component.scss'],
})
export class CourseManagementPageComponent implements OnInit {
  private readonly instructorId = this.authService.currentProfileId ?? '';

  readonly columns: DataTableColumn[] = [
    { key: 'courseCode', header: 'Course Code' },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Created At', sortable: true },
  ];

  private allCourses: CourseResponse[] = [];
  visibleCourses: CourseResponse[] = [];

  isLoading = true;
  errorMessage: string | null = null;

  status: CourseStatus | '' = '';
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  currentSort: SortState = { field: 'createdAt', direction: 'desc' };

  totalElements = 0;
  totalPages = 0;

  readonly courseCreateRoute = `/${AppRoutes.instructor.courseCreate}`;
  readonly statusOptions = Object.values(CourseStatus);

  constructor(
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly instructorPerformanceApiService: InstructorPerformanceApiService,
    private readonly instructorCourseApiService: InstructorCourseApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Course Management | Infy_LearnX');

    this.route.queryParams.subscribe((params) => {
      this.status = (params['status'] as CourseStatus) || '';
      this.currentPage = params['page'] ? Number(params['page']) + 1 : 1;
      this.pageSize = params['size'] ? Number(params['size']) : DEFAULT_PAGE_SIZE;
      const sortParam: string = params['sort'] || 'createdAt,desc';
      const [field, direction] = sortParam.split(',');
      this.currentSort = { field, direction: direction === 'desc' ? 'desc' : 'asc' };

      this.loadCourses();
    });
  }

  moduleManagementRoute(courseId: string): string {
    return `/${AppRoutes.instructor.moduleManagement(courseId)}`;
  }

  courseEditRoute(courseId: string): string {
    return `/${AppRoutes.instructor.courseEdit(courseId)}`;
  }

  viewCourse(courseId: string): void {
    this.router.navigate([this.moduleManagementRoute(courseId)]);
  }

  editCourse(courseId: string): void {
    this.router.navigate([this.courseEditRoute(courseId)]);
  }

  onStatusChange(status: CourseStatus | ''): void {
    this.updateQueryParams({ status, page: 0 });
  }

  onSortChange(sort: SortState): void {
    this.updateQueryParams({ sort: `${sort.field},${sort.direction}` });
  }

  onPageChange(page: number): void {
    this.updateQueryParams({ page });
  }

  onPageSizeChange(size: number): void {
    this.updateQueryParams({ size, page: 0 });
  }

  retry(): void {
    this.loadCourses();
  }

  private updateQueryParams(changes: Record<string, string | number>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.status || null,
        page: this.currentPage - 1,
        size: this.pageSize,
        sort: `${this.currentSort.field},${this.currentSort.direction}`,
        ...changes,
      },
    });
  }

  private loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.instructorPerformanceApiService.getPerformance(this.instructorId).subscribe({
      next: (performance) => {
        const courseIds = performance.courses.map((c) => c.courseId);
        if (courseIds.length === 0) {
          this.allCourses = [];
          this.applyClientSideView();
          this.isLoading = false;
          return;
        }
        forkJoin(courseIds.map((id) => this.instructorCourseApiService.getCourseById(id))).subscribe({
          next: (courses) => {
            this.allCourses = courses;
            this.applyClientSideView();
            this.isLoading = false;
          },
          error: () => {
            this.errorMessage = 'Unable to load your courses. Please try again.';
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.errorMessage = 'Unable to load your courses. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private applyClientSideView(): void {
    let filtered = this.allCourses;
    if (this.status) {
      filtered = filtered.filter((course) => course.status === this.status);
    }

    const sorted = [...filtered].sort((a, b) => {
      const aValue = String((a as unknown as Record<string, unknown>)[this.currentSort.field] ?? '');
      const bValue = String((b as unknown as Record<string, unknown>)[this.currentSort.field] ?? '');
      return aValue.localeCompare(bValue);
    });
    if (this.currentSort.direction === 'desc') {
      sorted.reverse();
    }

    this.totalElements = sorted.length;
    this.totalPages = Math.max(1, Math.ceil(sorted.length / this.pageSize));

    const start = (this.currentPage - 1) * this.pageSize;
    this.visibleCourses = sorted.slice(start, start + this.pageSize);
  }
}
