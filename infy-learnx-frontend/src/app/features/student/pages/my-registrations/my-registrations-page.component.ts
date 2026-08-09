import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { RegistrationResponse, RegistrationStatus } from '../../../../core/models/registration.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { RegistrationApiService } from '../../services/registration-api.service';

interface RegistrationRow {
  registration: RegistrationResponse;
  assessmentTitle: string;
  assessmentStartTime: string;
  canCancel: boolean;
  canReRegister: boolean;
  isActioning: boolean;
}

// GET /api/students/{id}/registrations accepts no sort/page/size params —
// default sort (registeredAt,desc) and pagination are applied client-side,
// same as every other list endpoint in this backend.
@Component({
  selector: 'app-my-registrations-page',
  templateUrl: './my-registrations-page.component.html',
  styleUrls: ['./my-registrations-page.component.scss'],
})
export class MyRegistrationsPageComponent implements OnInit {
  private readonly studentId = this.authService.currentProfileId ?? '';
  private allRows: RegistrationRow[] = [];
  private filteredRows: RegistrationRow[] = [];

  visibleRows: RegistrationRow[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  statusFilter: RegistrationStatus | '' = '';
  readonly statusOptions = Object.values(RegistrationStatus);

  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly registrationApiService: RegistrationApiService,
    private readonly assessmentApiService: AssessmentApiService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('My Registrations | Infy_LearnX');
    this.load();
  }

  retry(): void {
    this.load();
  }

  onStatusFilterChange(status: RegistrationStatus | ''): void {
    this.statusFilter = status;
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

  onCancel(row: RegistrationRow): void {
    this.dialogService
      .confirm({
        title: 'Cancel registration?',
        bodyMessage: `Cancel your registration for "${row.assessmentTitle}"?`,
        confirmLabel: 'Cancel Registration',
        cancelLabel: 'Keep Registration',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        row.isActioning = true;
        this.registrationApiService.cancelRegistration(row.registration.registrationId).subscribe({
          next: (updated) => {
            row.registration = updated;
            row.isActioning = false;
            this.recomputeRowFlags(row);
          },
          error: (error: { message?: string }) => {
            row.isActioning = false;
            this.notificationService.showError(error?.message ?? 'Unable to cancel registration.');
          },
        });
      });
  }

  onReRegister(row: RegistrationRow): void {
    this.dialogService
      .confirm({
        title: 'Re-register?',
        bodyMessage: `Re-register for "${row.assessmentTitle}"?`,
        confirmLabel: 'Re-register',
        cancelLabel: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        row.isActioning = true;
        this.registrationApiService.reRegisterForAssessment(row.registration.registrationId).subscribe({
          next: (updated) => {
            row.registration = updated;
            row.isActioning = false;
            this.recomputeRowFlags(row);
          },
          error: (error: { message?: string }) => {
            row.isActioning = false;
            this.notificationService.showError(error?.message ?? 'Unable to re-register.');
          },
        });
      });
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.registrationApiService.getStudentRegistrations(this.studentId).subscribe({
      next: (registrations) => {
        const uniqueAssessmentIds = Array.from(new Set(registrations.map((r) => r.assessmentId)));
        if (uniqueAssessmentIds.length === 0) {
          this.allRows = [];
          this.currentPage = 1;
          this.applyFilter();
          this.isLoading = false;
          return;
        }

        forkJoin(
          uniqueAssessmentIds.map((id) =>
            this.assessmentApiService.getAssessmentById(id).pipe(catchError(() => of(null))),
          ),
        ).subscribe((assessments) => {
          const titleMap = new Map<string, string>();
          const startTimeMap = new Map<string, string>();
          assessments.forEach((assessment, index) => {
            if (assessment) {
              titleMap.set(uniqueAssessmentIds[index], assessment.title);
              startTimeMap.set(uniqueAssessmentIds[index], assessment.startTime);
            }
          });

          this.allRows = registrations
            .map((registration) => {
              const startTime = startTimeMap.get(registration.assessmentId);
              const isUpcoming = !!startTime && new Date(startTime).getTime() > Date.now();
              return {
                registration,
                assessmentTitle: titleMap.get(registration.assessmentId) ?? registration.assessmentId,
                assessmentStartTime: startTime ?? '',
                canCancel: registration.status === RegistrationStatus.REGISTERED && isUpcoming,
                canReRegister: registration.status === RegistrationStatus.CANCELLED && isUpcoming,
                isActioning: false,
              };
            })
            .sort(
              (a, b) => new Date(b.registration.registeredAt).getTime() - new Date(a.registration.registeredAt).getTime(),
            );
          this.currentPage = 1;
          this.applyFilter();
          this.isLoading = false;
        });
      },
      error: () => {
        this.errorMessage = 'Unable to load your registrations. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private recomputeRowFlags(row: RegistrationRow): void {
    const isUpcoming = row.canCancel || row.canReRegister;
    row.canCancel = row.registration.status === RegistrationStatus.REGISTERED && isUpcoming;
    row.canReRegister = row.registration.status === RegistrationStatus.CANCELLED && isUpcoming;
  }

  private applyFilter(): void {
    this.filteredRows = this.statusFilter
      ? this.allRows.filter((row) => row.registration.status === this.statusFilter)
      : this.allRows;
    this.applyPagination();
  }

  private applyPagination(): void {
    this.totalElements = this.filteredRows.length;
    this.totalPages = Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize;
    this.visibleRows = this.filteredRows.slice(start, start + this.pageSize);
  }
}
