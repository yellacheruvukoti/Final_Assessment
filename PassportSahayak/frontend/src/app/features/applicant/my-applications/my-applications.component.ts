import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationResponse, ApplicationStatusResponse } from '../../../core/models/application.model';

@Component({
  selector: 'ps-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.scss']
})
export class MyApplicationsComponent implements OnInit {
  loading = true;
  applications: ApplicationResponse[] = [];
  columns = ['arn', 'type', 'scheme', 'status', 'fee', 'actions'];

  selected: ApplicationResponse | null = null;
  statusDetail: ApplicationStatusResponse | null = null;
  loadingDetail = false;

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.applicationService.mine()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => (this.applications = res));
  }

  select(app: ApplicationResponse): void {
    this.selected = app;
    this.statusDetail = null;
    this.loadingDetail = true;
    this.applicationService.getStatus(app.arn)
      .pipe(finalize(() => (this.loadingDetail = false)))
      .subscribe((res) => (this.statusDetail = res));
  }

  close(): void {
    this.selected = null;
    this.statusDetail = null;
  }
}
