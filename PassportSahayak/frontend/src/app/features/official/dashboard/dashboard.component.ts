import { Component, OnInit } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import { PvService } from '../../../core/services/pv.service';
import { GrievanceService } from '../../../core/services/grievance.service';
import { FraudService } from '../../../core/services/fraud.service';
import { Page } from '../../../core/models/page.model';

const EMPTY_PAGE: Page<unknown> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true, empty: true };

@Component({
  selector: 'ps-official-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class OfficialDashboardComponent implements OnInit {
  loading = true;

  submittedApplications = 0;
  pvOverdue = 0;
  openGrievances = 0;
  pendingAppeals = 0;
  reportedFraud = 0;

  constructor(
    private applicationService: ApplicationService,
    private pvService: PvService,
    private grievanceService: GrievanceService,
    private fraudService: FraudService
  ) {}

  ngOnInit(): void {
    // Each call is independently fault-tolerant: if one service is unavailable, its stat
    // card just falls back to 0 instead of the whole dashboard hanging in a loading state.
    forkJoin({
      applications: this.applicationService.listByStatus('SUBMITTED', 0, 1).pipe(catchError(() => of(EMPTY_PAGE))),
      pv: this.pvService.listByStatus('OVERDUE', 0, 1).pipe(catchError(() => of(EMPTY_PAGE))),
      grievances: this.grievanceService.listByStatus('OPEN', 0, 1).pipe(catchError(() => of(EMPTY_PAGE))),
      appeals: this.grievanceService.listAppealsByStatus('PENDING', 0, 1).pipe(catchError(() => of(EMPTY_PAGE))),
      fraud: this.fraudService.listByStatus('REPORTED', 0, 1).pipe(catchError(() => of(EMPTY_PAGE)))
    }).pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.submittedApplications = res.applications.totalElements;
        this.pvOverdue = res.pv.totalElements;
        this.openGrievances = res.grievances.totalElements;
        this.pendingAppeals = res.appeals.totalElements;
        this.reportedFraud = res.fraud.totalElements;
      });
  }
}
