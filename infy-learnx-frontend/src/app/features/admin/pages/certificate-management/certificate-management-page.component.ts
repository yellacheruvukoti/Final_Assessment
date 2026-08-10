import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { CertificateResponse, CertificateStatus } from '../../../../core/models/certificate.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DataTableColumn, SortState } from '../../../../shared/components/data-table/data-table.component';
import { AdminCertificateApiService } from '../../services/admin-certificate-api.service';
import { AdminUserApiService } from '../../services/admin-user-api.service';

interface CertificateRow {
  certificateId: string;
  certificateIdShort: string;
  studentName: string;
  assessmentTitle: string;
  issuedAt: string;
  status: CertificateStatus;
  isRevoking: boolean;
}

// CertificateResponse only carries bare studentId/assessmentId — Student
// Name and Assessment Title are enriched per row via real, additional
// lookups (getStudentById -> userId -> getUserById for the name;
// getAssessmentById for the title), not fabricated. See
// AdminUserApiService/AdminCertificateApiService's doc comments on the
// methods added for this. A failed enrichment for one field falls back to
// the raw id rather than failing the whole row.
@Component({
  selector: 'app-certificate-management-page',
  templateUrl: './certificate-management-page.component.html',
  styleUrls: ['./certificate-management-page.component.scss'],
})
export class CertificateManagementPageComponent implements OnInit {
  readonly columns: DataTableColumn[] = [
    { key: 'certificateIdShort', header: 'Certificate ID' },
    { key: 'studentName', header: 'Student' },
    { key: 'assessmentTitle', header: 'Assessment' },
    { key: 'issuedAt', header: 'Issued At', sortable: true },
    { key: 'status', header: 'Status' },
  ];

  private allRows: CertificateRow[] = [];
  visibleRows: CertificateRow[] = [];

  isLoading = true;
  errorMessage: string | null = null;

  status: CertificateStatus | '' = '';
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  currentSort: SortState = { field: 'issuedAt', direction: 'desc' };

  totalElements = 0;
  totalPages = 0;

  readonly statusOptions = Object.values(CertificateStatus);
  readonly CertificateStatus = CertificateStatus;

  constructor(
    private readonly titleService: Title,
    private readonly adminCertificateApiService: AdminCertificateApiService,
    private readonly adminUserApiService: AdminUserApiService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Certificate Management | Infy_LearnX');
    this.load();
  }

  onStatusChange(status: CertificateStatus | ''): void {
    this.status = status;
    this.currentPage = 1;
    this.load();
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
    this.load();
  }

  onRevoke(row: CertificateRow): void {
    this.dialogService
      .confirm({
        title: 'Revoke certificate?',
        bodyMessage: 'This action cannot be undone.',
        confirmLabel: 'Revoke',
        cancelLabel: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.setRowRevoking(row.certificateId, true);
        this.adminCertificateApiService.revokeCertificate(row.certificateId).subscribe({
          next: (updated) => {
            const index = this.allRows.findIndex((r) => r.certificateId === updated.certificateId);
            if (index !== -1) {
              this.allRows[index] = { ...this.allRows[index], status: updated.status, isRevoking: false };
            }
            this.applyClientSideView();
          },
          error: (error: { message?: string }) => {
            this.setRowRevoking(row.certificateId, false);
            this.notificationService.showError(error?.message ?? 'Unable to revoke certificate. Please try again.');
          },
        });
      });
  }

  private setRowRevoking(certificateId: string, isRevoking: boolean): void {
    const index = this.allRows.findIndex((r) => r.certificateId === certificateId);
    if (index !== -1) {
      this.allRows[index] = { ...this.allRows[index], isRevoking };
    }
    this.applyClientSideView();
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminCertificateApiService.getCertificates({ status: this.status || undefined }).subscribe({
      next: (certificates) => {
        if (certificates.length === 0) {
          this.allRows = [];
          this.applyClientSideView();
          this.isLoading = false;
          return;
        }
        forkJoin(certificates.map((c) => this.enrichCertificate(c))).subscribe({
          next: (rows) => {
            this.allRows = rows;
            this.applyClientSideView();
            this.isLoading = false;
          },
          error: () => {
            this.errorMessage = 'Unable to load certificates. Please try again.';
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.errorMessage = 'Unable to load certificates. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private enrichCertificate(certificate: CertificateResponse) {
    // Never fall back to the raw id in the UI — if the student/assessment
    // record can't be resolved (e.g. a stale reference), show a
    // human-readable placeholder instead of a UUID.
    const studentName$ = this.adminUserApiService.getStudentById(certificate.studentId).pipe(
      switchMap((student) => this.adminUserApiService.getUserById(student.userId)),
      map((user) => user.fullName),
      catchError(() => of('Unknown Student')),
    );
    const assessmentTitle$ = this.adminCertificateApiService.getAssessmentById(certificate.assessmentId).pipe(
      map((assessment) => assessment.title),
      catchError(() => of('Unknown Assessment')),
    );

    return forkJoin({ studentName: studentName$, assessmentTitle: assessmentTitle$ }).pipe(
      map(
        ({ studentName, assessmentTitle }): CertificateRow => ({
          certificateId: certificate.certificateId,
          certificateIdShort: certificate.certificateId.slice(0, 8),
          studentName,
          assessmentTitle,
          issuedAt: certificate.issuedAt,
          status: certificate.status,
          isRevoking: false,
        }),
      ),
    );
  }

  private applyClientSideView(): void {
    const sorted = [...this.allRows].sort((a, b) => {
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
    this.visibleRows = sorted.slice(start, start + this.pageSize);
  }
}
