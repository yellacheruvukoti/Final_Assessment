import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { AssessmentResponse, ScopeType } from '../../../../core/models/assessment.model';
import { RegistrationStatus } from '../../../../core/models/registration.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { RegistrationApiService } from '../../services/registration-api.service';

interface AssessmentRow {
  assessment: AssessmentResponse;
  isRegistered: boolean;
  isRegistering: boolean;
}

// GET /api/assessments/upcoming accepts no query params at all (verified
// against AssessmentController source) — default sort (startTime,asc) and
// pagination are applied client-side, same established approach as every
// other list endpoint in this backend.
@Component({
  selector: 'app-upcoming-assessments-page',
  templateUrl: './upcoming-assessments-page.component.html',
  styleUrls: ['./upcoming-assessments-page.component.scss'],
})
export class UpcomingAssessmentsPageComponent implements OnInit {
  private readonly studentId = this.authService.currentProfileId ?? '';
  private allRows: AssessmentRow[] = [];

  visibleRows: AssessmentRow[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly assessmentApiService: AssessmentApiService,
    private readonly registrationApiService: RegistrationApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Upcoming Assessments | Infy_LearnX');
    this.load();
  }

  retry(): void {
    this.load();
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

  onRegister(row: AssessmentRow): void {
    row.isRegistering = true;
    this.registrationApiService
      .registerForAssessment({ studentId: this.studentId, assessmentId: row.assessment.assessmentId })
      .subscribe({
        next: () => {
          row.isRegistering = false;
          row.isRegistered = true;
          this.notificationService.showSuccess('Registered successfully.');
        },
        error: (error: { message?: string }) => {
          row.isRegistering = false;
          this.notificationService.showError(
            error?.message ?? 'Unable to register for this assessment. Please try again.',
          );
        },
      });
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      upcoming: this.assessmentApiService.getUpcomingAssessments(),
      registrations: this.registrationApiService.getStudentRegistrations(this.studentId),
    }).subscribe({
      next: ({ upcoming, registrations }) => {
        const registeredIds = new Set(
          registrations.filter((r) => r.status === RegistrationStatus.REGISTERED).map((r) => r.assessmentId),
        );
        this.allRows = [...upcoming.data]
          // This tab is the batch-assessment flow only (requirement 21):
          // course-based assessments are reached from Course Details for
          // enrolled students instead, so the two flows stay separate.
          .filter((assessment) => assessment.scopeType === ScopeType.BATCH)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .map((assessment) => ({
            assessment,
            isRegistered: registeredIds.has(assessment.assessmentId),
            isRegistering: false,
          }));
        this.currentPage = 1;
        this.applyPagination();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load upcoming assessments. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private applyPagination(): void {
    this.totalElements = this.allRows.length;
    this.totalPages = Math.max(1, Math.ceil(this.allRows.length / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize;
    this.visibleRows = this.allRows.slice(start, start + this.pageSize);
  }
}
