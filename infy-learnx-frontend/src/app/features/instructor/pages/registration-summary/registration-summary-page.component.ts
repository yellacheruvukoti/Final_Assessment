import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { RegistrationSummaryResponse, AssessmentSummaryItem } from '../../../../core/models/summary.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { SummaryTabId } from '../../components/summary-tabs/summary-tabs.component';
import { InstructorSummaryApiService } from '../../services/instructor-summary-api.service';

// KNOWN BACKEND QUIRK (not a gap, just a real behavior worth documenting):
// GET .../batches/{id}/status literally delegates to the same computation
// as GET .../batches/{id} on the backend (SummaryService.getStatusWiseSummary
// just calls getBatchSummary) — both return the identical
// RegistrationSummaryResponse shape. "By Status" is therefore rendered as
// a 2-row breakdown (REGISTERED / CANCELLED) derived from that one
// response, distinct in presentation from Overview's single totals row,
// even though the underlying numbers are the same real data.
//
// No endpoint lets an instructor discover their own batchId — BatchController
// only has GET /api/batches/{id} (must already know the id), no list. The
// batch id is therefore a manually-entered/editable field here, consistent
// with it being a required route param (frontend-tasks.md's route table).
@Component({
  selector: 'app-registration-summary-page',
  templateUrl: './registration-summary-page.component.html',
  styleUrls: ['./registration-summary-page.component.scss'],
})
export class RegistrationSummaryPageComponent implements OnInit {
  batchId = '';
  batchIdInput = '';

  activeTab: SummaryTabId = 'overview';

  overview: RegistrationSummaryResponse | null = null;
  isLoadingOverview = true;
  overviewError: string | null = null;

  byAssessment: AssessmentSummaryItem[] = [];
  isLoadingByAssessment = false;
  byAssessmentError: string | null = null;
  private byAssessmentLoaded = false;

  byStatus: RegistrationSummaryResponse | null = null;
  isLoadingByStatus = false;
  byStatusError: string | null = null;
  private byStatusLoaded = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly instructorSummaryApiService: InstructorSummaryApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.batchId = params.get('batchId') ?? '';
      this.batchIdInput = this.batchId;
      this.byAssessmentLoaded = false;
      this.byStatusLoaded = false;
      this.activeTab = 'overview';
      this.titleService.setTitle(`Registration Summary – ${this.batchId} | Infy_LearnX`);
      if (this.batchId) {
        this.loadOverview();
      }
    });
  }

  onLoadBatch(): void {
    const trimmed = this.batchIdInput.trim();
    if (!trimmed || trimmed === this.batchId) {
      return;
    }
    this.router.navigate(['/instructor/summary', trimmed]);
  }

  onTabChange(tab: SummaryTabId): void {
    this.activeTab = tab;
    if (tab === 'byAssessment' && !this.byAssessmentLoaded) {
      this.loadByAssessment();
    }
    if (tab === 'byStatus' && !this.byStatusLoaded) {
      this.loadByStatus();
    }
  }

  retryOverview(): void {
    this.loadOverview();
  }

  retryByAssessment(): void {
    this.loadByAssessment();
  }

  retryByStatus(): void {
    this.loadByStatus();
  }

  private loadOverview(): void {
    this.isLoadingOverview = true;
    this.overviewError = null;
    this.instructorSummaryApiService.getBatchSummary(this.batchId).subscribe({
      next: (summary) => {
        this.overview = summary;
        this.isLoadingOverview = false;
      },
      error: (error: { code?: string; message?: string }) => {
        this.isLoadingOverview = false;
        this.handleSummaryError(error, () => (this.overviewError = 'Unable to load the batch summary.'));
      },
    });
  }

  private loadByAssessment(): void {
    this.isLoadingByAssessment = true;
    this.byAssessmentError = null;
    this.instructorSummaryApiService.getAssessmentSummary(this.batchId).subscribe({
      next: (summary) => {
        this.byAssessment = summary.assessments;
        this.byAssessmentLoaded = true;
        this.isLoadingByAssessment = false;
      },
      error: (error: { code?: string; message?: string }) => {
        this.isLoadingByAssessment = false;
        this.handleSummaryError(error, () => (this.byAssessmentError = 'Unable to load the assessment breakdown.'));
      },
    });
  }

  private loadByStatus(): void {
    this.isLoadingByStatus = true;
    this.byStatusError = null;
    this.instructorSummaryApiService.getStatusSummary(this.batchId).subscribe({
      next: (summary) => {
        this.byStatus = summary;
        this.byStatusLoaded = true;
        this.isLoadingByStatus = false;
      },
      error: (error: { code?: string; message?: string }) => {
        this.isLoadingByStatus = false;
        this.handleSummaryError(error, () => (this.byStatusError = 'Unable to load the status breakdown.'));
      },
    });
  }

  private handleSummaryError(error: { code?: string; message?: string }, setLocalError: () => void): void {
    if (error?.code === 'SUMMARY_ACCESS_DENIED') {
      this.notificationService.showError(error.message ?? 'You are not authorized to view this batch summary.');
      return;
    }
    setLocalError();
  }
}
