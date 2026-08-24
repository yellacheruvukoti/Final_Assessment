import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationResponse, ApplicationStatus, PvType } from '../../../core/models/application.model';

@Component({
  selector: 'ps-applications-queue',
  templateUrl: './applications-queue.component.html',
  styleUrls: ['./applications-queue.component.scss']
})
export class ApplicationsQueueComponent implements OnInit {
  statuses: ApplicationStatus[] = [
    'SUBMITTED', 'APPOINTMENT_BOOKED', 'PSK_VISIT_COMPLETED', 'PV_DISPATCHED', 'PV_IN_PROGRESS',
    'PV_CLEARED', 'PASSPORT_DISPATCHED', 'PASSPORT_DELIVERED', 'ON_HOLD', 'REJECTED', 'CANCELLED'
  ];
  pvTypes: PvType[] = ['PRE_PV', 'POST_PV', 'PV_EXEMPT', 'EXPEDITED_PRE_PV'];

  selectedStatus: ApplicationStatus = 'SUBMITTED';
  applications: ApplicationResponse[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = true;
  columns = ['arn', 'type', 'scheme', 'pv', 'status', 'fee', 'actions'];

  editing: ApplicationResponse | null = null;
  saving = false;
  editForm = this.fb.group({
    status: ['SUBMITTED' as ApplicationStatus, Validators.required],
    pvType: [null as PvType | null],
    remarks: ['']
  });

  constructor(private fb: FormBuilder, private applicationService: ApplicationService) {}

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
    this.applicationService.listByStatus(this.selectedStatus, this.pageIndex, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.applications = res.content;
        this.totalElements = res.totalElements;
      });
  }

  startEdit(app: ApplicationResponse): void {
    this.editing = app;
    this.editForm.reset({ status: app.status, pvType: app.pvType ?? null, remarks: app.remarks ?? '' });
  }

  save(): void {
    if (!this.editing || this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.saving = true;
    this.applicationService.updateStatus(this.editing.arn, {
      status: v.status!,
      pvType: v.pvType,
      remarks: v.remarks || null
    }).pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.editing = null;
        this.load();
      });
  }
}
