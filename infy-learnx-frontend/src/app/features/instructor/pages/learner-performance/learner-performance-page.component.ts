import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseFilterOption } from '../../components/performance-filters/performance-filters.component';
import { CoursePerformanceItem, InstructorPerformanceApiService } from '../../services/instructor-performance-api.service';

// KNOWN BACKEND GAP (see PerformanceFiltersComponent's doc comment):
// frontend-tasks.md I-05 describes a per-student table (Student Name,
// Course Title, Module Title, Completion %, Progress Status, Last
// Accessed) sortable by studentName. No such data exists anywhere in the
// backend — GET /api/instructors/{id}/performance is a course-level
// aggregate only. This page honestly renders what that endpoint actually
// returns: one row per owned course (Course Title, Enrolled Count,
// Completion % as progress bar + numeric), which is the closest real
// substitute, sorted/paginated the same as every other client-side table.
@Component({
  selector: 'app-learner-performance-page',
  templateUrl: './learner-performance-page.component.html',
  styleUrls: ['./learner-performance-page.component.scss'],
})
export class LearnerPerformancePageComponent implements OnInit {
  private readonly instructorId = this.authService.currentProfileId ?? '';
  private allCourses: CoursePerformanceItem[] = [];
  private filteredCourses: CoursePerformanceItem[] = [];

  visibleCourses: CoursePerformanceItem[] = [];
  courseOptions: CourseFilterOption[] = [];
  selectedCourseId = '';

  isLoading = true;
  errorMessage: string | null = null;

  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly instructorPerformanceApiService: InstructorPerformanceApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Learner Performance | Infy_LearnX');
    this.load();
  }

  onCourseFilterChange(courseId: string): void {
    this.selectedCourseId = courseId;
    this.currentPage = 1;
    this.applyFilter();
  }

  onPageChange(page: number): void {
    this.currentPage = page + 1;
    this.applyPagination();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyPagination();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.instructorPerformanceApiService.getPerformance(this.instructorId).subscribe({
      next: (performance) => {
        this.allCourses = [...performance.courses].sort((a, b) => a.title.localeCompare(b.title));
        this.courseOptions = this.allCourses.map((c) => ({ courseId: c.courseId, title: c.title }));
        this.currentPage = 1;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load learner performance. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private applyFilter(): void {
    this.filteredCourses = this.selectedCourseId
      ? this.allCourses.filter((c) => c.courseId === this.selectedCourseId)
      : this.allCourses;
    this.applyPagination();
  }

  private applyPagination(): void {
    this.totalElements = this.filteredCourses.length;
    this.totalPages = Math.max(1, Math.ceil(this.filteredCourses.length / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize;
    this.visibleCourses = this.filteredCourses.slice(start, start + this.pageSize);
  }
}
