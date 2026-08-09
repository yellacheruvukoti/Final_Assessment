import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { AssessmentResponse, AssessmentStatus } from '../../../../core/models/assessment.model';
import { DataTableColumn, SortState } from '../../../../shared/components/data-table/data-table.component';
import { InstructorAssessmentApiService } from '../../services/instructor-assessment-api.service';

// GET /api/assessments genuinely accepts and respects a `status` query
// param (verified against AssessmentController source — unlike most other
// list endpoints in this backend). Sort/pagination are still client-side
// since no page/size/sort params exist.
@Component({
  selector: 'app-assessment-management-page',
  templateUrl: './assessment-management-page.component.html',
  styleUrls: ['./assessment-management-page.component.scss'],
})
export class AssessmentManagementPageComponent implements OnInit {
  readonly columns: DataTableColumn[] = [
    { key: 'assessmentCode', header: 'Assessment Code' },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'status', header: 'Status' },
    { key: 'startTime', header: 'Start Time', sortable: true },
    { key: 'scopeType', header: 'Scope' },
  ];

  private allAssessments: AssessmentResponse[] = [];
  visibleAssessments: AssessmentResponse[] = [];

  isLoading = true;
  errorMessage: string | null = null;

  status: AssessmentStatus | '' = '';
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  currentSort: SortState = { field: 'startTime', direction: 'asc' };

  totalElements = 0;
  totalPages = 0;

  readonly statusOptions = Object.values(AssessmentStatus);
  readonly assessmentCreateRoute = `/${AppRoutes.instructor.assessmentCreate}`;

  constructor(
    private readonly titleService: Title,
    private readonly instructorAssessmentApiService: InstructorAssessmentApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Assessment Management | Infy_LearnX');
    this.loadAssessments();
  }

  assessmentEditRoute(assessmentId: string): string {
    return `/${AppRoutes.instructor.assessmentEdit(assessmentId)}`;
  }

  onStatusChange(status: AssessmentStatus | ''): void {
    this.status = status;
    this.currentPage = 1;
    this.loadAssessments();
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

  retry(): void {
    this.loadAssessments();
  }

  private loadAssessments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.instructorAssessmentApiService.getAssessments({ status: this.status || undefined }).subscribe({
      next: (assessments) => {
        this.allAssessments = assessments;
        this.applyClientSideView();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load assessments. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private applyClientSideView(): void {
    const sorted = [...this.allAssessments].sort((a, b) => {
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
    this.visibleAssessments = sorted.slice(start, start + this.pageSize);
  }
}
