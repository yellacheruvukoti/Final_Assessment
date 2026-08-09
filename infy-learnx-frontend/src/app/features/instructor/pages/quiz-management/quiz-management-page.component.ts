import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { QuizResponse, QuizStatus } from '../../../../core/models/quiz.model';
import { DataTableColumn, SortState } from '../../../../shared/components/data-table/data-table.component';
import { InstructorQuizApiService } from '../../services/instructor-quiz-api.service';

// GET /api/courses/{id}/quizzes takes no query params (verified against
// learning-service's CourseController source) — filter/sort/pagination are
// applied client-side against the full per-course result set, same
// established approach as Course Catalog (K-01) and Course Management.
@Component({
  selector: 'app-quiz-management-page',
  templateUrl: './quiz-management-page.component.html',
  styleUrls: ['./quiz-management-page.component.scss'],
})
export class QuizManagementPageComponent implements OnInit {
  readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

  courseTitle = '';

  readonly columns: DataTableColumn[] = [
    { key: 'title', header: 'Quiz Title', sortable: true },
    { key: 'status', header: 'Status' },
    { key: 'scheduledAt', header: 'Scheduled At', sortable: true },
    { key: 'durationMinutes', header: 'Duration (min)' },
    { key: 'totalMarks', header: 'Total Marks' },
  ];

  private allQuizzes: QuizResponse[] = [];
  visibleQuizzes: QuizResponse[] = [];
  private readonly updatingQuizIds = new Set<string>();

  isLoading = true;
  errorMessage: string | null = null;

  status: QuizStatus | '' = '';
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  currentSort: SortState = { field: 'createdAt', direction: 'desc' };

  totalElements = 0;
  totalPages = 0;

  readonly statusOptions = Object.values(QuizStatus);
  readonly quizCreateRoute = `/${AppRoutes.instructor.quizCreate}`;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly instructorQuizApiService: InstructorQuizApiService,
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  quizEditRoute(quizId: string): string {
    return `/${AppRoutes.instructor.quizEdit(quizId)}`;
  }

  isUpdating(quizId: string): boolean {
    return this.updatingQuizIds.has(quizId);
  }

  onStatusFilterChange(status: QuizStatus | ''): void {
    this.status = status;
    this.currentPage = 1;
    this.applyClientSideView();
  }

  onSortChange(sort: SortState): void {
    this.currentSort = sort;
    this.applyClientSideView();
  }

  onPageChange(page: number): void {
    this.currentPage = page + 1;
    this.applyClientSideView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyClientSideView();
  }

  onRowStatusChange(quiz: QuizResponse, newStatus: QuizStatus): void {
    if (newStatus === quiz.status) {
      return;
    }
    this.updatingQuizIds.add(quiz.quizId);
    this.instructorQuizApiService
      .updateQuiz(quiz.quizId, {
        title: quiz.title,
        status: newStatus,
        scheduledAt: quiz.scheduledAt,
        durationMinutes: quiz.durationMinutes,
        totalMarks: quiz.totalMarks,
      })
      .subscribe({
        next: (updated) => {
          this.updatingQuizIds.delete(quiz.quizId);
          const index = this.allQuizzes.findIndex((q) => q.quizId === updated.quizId);
          if (index !== -1) {
            this.allQuizzes[index] = updated;
          }
          this.applyClientSideView();
        },
        error: () => {
          this.updatingQuizIds.delete(quiz.quizId);
        },
      });
  }

  retry(): void {
    this.loadQuizzes();
  }

  private loadQuizzes(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.instructorQuizApiService.getQuizzesByCourse(this.courseId).subscribe({
      next: (quizzes) => {
        this.allQuizzes = quizzes;
        this.applyClientSideView();
        this.isLoading = false;
        this.titleService.setTitle(`Quiz Management – ${this.courseTitle || this.courseId} | Infy_LearnX`);
      },
      error: () => {
        this.errorMessage = 'Unable to load quizzes. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private applyClientSideView(): void {
    let filtered = this.allQuizzes;
    if (this.status) {
      filtered = filtered.filter((quiz) => quiz.status === this.status);
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
    this.visibleQuizzes = sorted.slice(start, start + this.pageSize);
  }
}
