import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { CertificateDownloadResponse, CertificateResponse } from '../../../../core/models/certificate.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { CertificateApiService } from '../../services/certificate-api.service';

interface CertificateRow {
  certificate: CertificateResponse;
  assessmentTitle: string;
  isDownloading: boolean;
}

// KNOWN DESIGN DECISION (see project memory
// infy_learnx_contract_decisions.md, point 3): certificate issuance
// requires a score field with no legitimate self-service source (verified
// — no quiz-grading exists anywhere in this system), so it was decided
// WITH the user that issuance is an INSTRUCTOR action, not a student one.
// This page is therefore read-only — view + download already-issued
// certificates — with no "Request Certificate" section, unlike
// frontend-tasks.md I-03's literal two-section description.
//
// GET /api/students/{id}/certificates accepts no sort/page/size params —
// default sort (issuedAt,desc) and pagination are applied client-side.
// Assessment Title is resolved per unique assessmentId (the certificate
// response only carries the bare id), same pattern used by
// MyRegistrationsPageComponent.
@Component({
  selector: 'app-my-certificates-page',
  templateUrl: './my-certificates-page.component.html',
  styleUrls: ['./my-certificates-page.component.scss'],
})
export class MyCertificatesPageComponent implements OnInit {
  private readonly studentId = this.authService.currentProfileId ?? '';
  private allRows: CertificateRow[] = [];

  visibleRows: CertificateRow[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly certificateApiService: CertificateApiService,
    private readonly assessmentApiService: AssessmentApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('My Certificates | Infy_LearnX');
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

  onDownload(row: CertificateRow): void {
    row.isDownloading = true;
    this.certificateApiService.downloadCertificate(row.certificate.certificateId).subscribe({
      next: (download) => {
        row.isDownloading = false;
        this.deliverDownload(download);
      },
      error: (error: { message?: string }) => {
        row.isDownloading = false;
        this.notificationService.showError(error?.message ?? 'Unable to download certificate.');
      },
    });
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.certificateApiService.getStudentCertificates(this.studentId).subscribe({
      next: (certificates) => {
        if (certificates.length === 0) {
          this.allRows = [];
          this.currentPage = 1;
          this.applyPagination();
          this.isLoading = false;
          return;
        }

        const uniqueAssessmentIds = Array.from(new Set(certificates.map((c) => c.assessmentId)));
        forkJoin(
          uniqueAssessmentIds.map((id) =>
            this.assessmentApiService.getAssessmentById(id).pipe(catchError(() => of(null))),
          ),
        ).subscribe((assessments) => {
          const titleMap = new Map<string, string>();
          assessments.forEach((assessment, index) => {
            if (assessment) {
              titleMap.set(uniqueAssessmentIds[index], assessment.title);
            }
          });

          this.allRows = [...certificates]
            .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
            .map((certificate) => ({
              certificate,
              assessmentTitle: titleMap.get(certificate.assessmentId) ?? certificate.assessmentId,
              isDownloading: false,
            }));
          this.currentPage = 1;
          this.applyPagination();
          this.isLoading = false;
        });
      },
      error: () => {
        this.errorMessage = 'Unable to load your certificates. Please try again.';
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

  // The backend's download endpoint returns JSON metadata + a
  // downloadToken, not a binary file (verified live — see
  // CertificateDownloadResponse's comment). No endpoint anywhere consumes
  // that token to serve real file bytes. Rather than pretend to deliver a
  // real certificate file, this builds a real, honest text file from the
  // data actually returned.
  private deliverDownload(download: CertificateDownloadResponse): void {
    const content = [
      `Certificate ID: ${download.certificateId}`,
      `Score: ${download.score}`,
      `Issued At: ${download.issuedAt}`,
      `Download Token: ${download.downloadToken}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `certificate-${download.certificateId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
