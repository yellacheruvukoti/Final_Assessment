import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { GrievanceService } from '../../../core/services/grievance.service';
import { AppealResponse, AppealStatus } from '../../../core/models/grievance.model';

@Component({
  selector: 'ps-appeals-queue',
  templateUrl: './appeals-queue.component.html',
  styleUrls: ['./appeals-queue.component.scss']
})
export class AppealsQueueComponent implements OnInit {
  statuses: AppealStatus[] = ['PENDING', 'DECIDED', 'ESCALATED'];

  selectedStatus: AppealStatus = 'PENDING';
  appeals: AppealResponse[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = true;
  columns = ['arn', 'level', 'status', 'ground', 'created', 'actions'];

  editing: AppealResponse | null = null;
  saving = false;
  editForm = this.fb.group({
    status: ['DECIDED' as AppealStatus, Validators.required],
    decisionNotes: ['']
  });

  constructor(private fb: FormBuilder, private grievanceService: GrievanceService) {}

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
    this.grievanceService.listAppealsByStatus(this.selectedStatus, this.pageIndex, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.appeals = res.content;
        this.totalElements = res.totalElements;
      });
  }

  startEdit(a: AppealResponse): void {
    this.editing = a;
    this.editForm.reset({ status: 'DECIDED', decisionNotes: a.decisionNotes ?? '' });
  }

  save(): void {
    if (!this.editing || this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.saving = true;
    this.grievanceService.decideAppeal(this.editing.id, { status: v.status!, decisionNotes: v.decisionNotes || null })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.editing = null;
        this.load();
      });
  }
}
