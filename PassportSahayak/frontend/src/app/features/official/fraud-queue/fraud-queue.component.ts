import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { FraudService } from '../../../core/services/fraud.service';
import { FraudReportResponse, FraudReportStatus } from '../../../core/models/fraud.model';

@Component({
  selector: 'ps-fraud-queue',
  templateUrl: './fraud-queue.component.html',
  styleUrls: ['./fraud-queue.component.scss']
})
export class FraudQueueComponent implements OnInit {
  statuses: FraudReportStatus[] = ['REPORTED', 'UNDER_REVIEW', 'REFERRED', 'CLOSED'];

  selectedStatus: FraudReportStatus = 'REPORTED';
  reports: FraudReportResponse[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = true;
  columns = ['category', 'arn', 'severity', 'authority', 'status', 'created', 'actions'];

  editing: FraudReportResponse | null = null;
  saving = false;
  editForm = this.fb.group({
    status: ['UNDER_REVIEW' as FraudReportStatus, Validators.required]
  });

  constructor(private fb: FormBuilder, private fraudService: FraudService) {}

  ngOnInit(): void {
    this.load();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(evt: PageEvent): void {
    this.pageIndex = evt.pageIndex;
    this.pageSize = evt.pageSize;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.fraudService.listByStatus(this.selectedStatus, this.pageIndex, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.reports = res.content;
        this.totalElements = res.totalElements;
      });
  }

  startEdit(r: FraudReportResponse): void {
    this.editing = r;
    this.editForm.reset({ status: r.status });
  }

  save(): void {
    if (!this.editing || this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.saving = true;
    this.fraudService.updateStatus(this.editing.id, { status: v.status! })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.editing = null;
        this.load();
      });
  }
}
