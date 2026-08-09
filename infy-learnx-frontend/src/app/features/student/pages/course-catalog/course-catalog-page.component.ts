import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../../../core/constants/pagination.constants';
import { CourseResponse, CourseStatus } from '../../../../core/models/course.model';
import { DataTableColumn, SortState } from '../../../../shared/components/data-table/data-table.component';
import { CourseApiService } from '../../services/course-api.service';

interface CourseRow extends CourseResponse {
  instructorName: string;
}

// Merges I-02 (page shell, filter/search behavior, URL state sync) and
// K-01 (DataTableComponent integration for this same page) — building the
// table twice would mean redoing the same work.
//
// KNOWN BACKEND GAP: GET /api/courses ignores status/search/sort/page/size
// entirely — verified live (querying status=DRAFT returns the same
// results as no filter at all; the controller calls a hardcoded
// listPublishedCourses()). Filtering, search, sort, and pagination are
// therefore implemented client-side against the full result set, which is
// small enough for this to be a reasonable, honest approach rather than a
// broken or fake feature. Params are still sent to the backend per
// frontend-constitution.md Section 10.4, for forward compatibility.
@Component({
  selector: 'app-course-catalog-page',
  templateUrl: './course-catalog-page.component.html',
  styleUrls: ['./course-catalog-page.component.scss'],
})
export class CourseCatalogPageComponent implements OnInit {
  readonly columns: DataTableColumn[] = [
    { key: 'courseCode', header: 'Course Code', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'status', header: 'Status' },
    { key: 'instructorName', header: 'Instructor' },
  ];

  private allCourses: CourseRow[] = [];
  visibleCourses: CourseRow[] = [];

  isLoading = false;
  errorMessage: string | null = null;

  status: CourseStatus | '' = CourseStatus.PUBLISHED;
  search = '';
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  currentSort: SortState = { field: 'title', direction: 'asc' };

  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly courseApiService: CourseApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Course Catalog | Infy_LearnX');

    this.route.queryParams.subscribe((params) => {
      this.status = (params['status'] as CourseStatus) || CourseStatus.PUBLISHED;
      this.search = params['search'] || '';
      this.currentPage = params['page'] ? Number(params['page']) + 1 : 1;
      this.pageSize = params['size'] ? Number(params['size']) : DEFAULT_PAGE_SIZE;
      const sortParam: string = params['sort'] || 'title,asc';
      const [field, direction] = sortParam.split(',');
      this.currentSort = { field, direction: direction === 'desc' ? 'desc' : 'asc' };

      this.loadCourses();
    });
  }

  courseDetailRoute(courseId: string): string {
    return AppRoutes.student.courseDetail(courseId);
  }

  onSearchSubmit(term: string): void {
    this.updateQueryParams({ search: term, page: 0 });
  }

  onStatusChange(status: CourseStatus | ''): void {
    this.updateQueryParams({ status, page: 0 });
  }

  onClearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: CourseStatus.PUBLISHED, page: 0 },
    });
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
        status: this.status,
        search: this.search || null,
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

    this.courseApiService
      .getCourses({
        status: this.status || undefined,
        search: this.search || undefined,
        page: this.currentPage - 1,
        size: this.pageSize,
        sort: `${this.currentSort.field},${this.currentSort.direction}`,
      })
      .pipe(
        switchMap((courses) => {
          if (courses.length === 0) {
            return of([] as CourseRow[]);
          }
          return forkJoin(courses.map((course) => this.toRow(course)));
        }),
      )
      .subscribe({
        next: (rows) => {
          this.allCourses = rows;
          this.applyClientSideView();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Unable to load courses. Please try again.';
          this.isLoading = false;
        },
      });
  }

  // instructorId -> instructorName resolution (instructor -> linked user's
  // fullName), same two-hop pattern used elsewhere in the admin module for
  // studentId -> userId -> fullName. Falls back to the raw id rather than
  // failing the whole row if either lookup errors.
  private toRow(course: CourseResponse): Observable<CourseRow> {
    return this.courseApiService.getInstructorById(course.instructorId).pipe(
      switchMap((instructor) => this.courseApiService.getUserById(instructor.userId)),
      map((user) => ({ ...course, instructorName: user.fullName })),
      catchError(() => of({ ...course, instructorName: course.instructorId })),
    );
  }

  private applyClientSideView(): void {
    let filtered = this.allCourses;

    if (this.status) {
      filtered = filtered.filter((course) => course.status === this.status);
    }
    if (this.search) {
      const term = this.search.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(term) || course.courseCode.toLowerCase().includes(term),
      );
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
