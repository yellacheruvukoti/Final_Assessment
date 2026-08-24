import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PvService } from '../../../core/services/pv.service';
import { ClassificationRule, PvCaseResponse, PvCaseStatus } from '../../../core/models/pv.model';

@Component({
  selector: 'ps-pv-queue',
  templateUrl: './pv-queue.component.html',
  styleUrls: ['./pv-queue.component.scss']
})
export class PvQueueComponent implements OnInit {
  statuses: PvCaseStatus[] = ['DISPATCHED', 'ASSIGNED', 'IN_PROGRESS', 'REPORT_RECEIVED', 'ADVERSE', 'CLEARED', 'OVERDUE'];

  selectedStatus: PvCaseStatus = 'DISPATCHED';
  cases: PvCaseResponse[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = true;
  columns = ['arn', 'pvType', 'location', 'status', 'slaDeadline', 'actions'];

  showDispatch = false;
  showRules = false;
  rules: ClassificationRule[] = [];
  dispatching = false;
  dispatchForm = this.fb.group({
    arn: ['', Validators.required],
    governmentServant: [false],
    seniorCitizen: [false],
    courtDirected: [false],
    addressChangedSinceLastPassport: [false],
    district: ['', Validators.required],
    state: ['', Validators.required]
  });

  editing: PvCaseResponse | null = null;
  saving = false;
  editForm = this.fb.group({
    status: ['DISPATCHED' as PvCaseStatus, Validators.required],
    remarks: ['']
  });

  constructor(private fb: FormBuilder, private pvService: PvService) {}

  ngOnInit(): void {
    this.load();
    this.pvService.classificationRules().subscribe((res) => (this.rules = res));
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
    this.pvService.listByStatus(this.selectedStatus, this.pageIndex, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.cases = res.content;
        this.totalElements = res.totalElements;
      });
  }

  refreshSlaBreaches(): void {
    this.pvService.refreshSlaBreaches().subscribe(() => this.load());
  }

  submitDispatch(): void {
    if (this.dispatchForm.invalid) {
      this.dispatchForm.markAllAsTouched();
      return;
    }
    const v = this.dispatchForm.getRawValue();
    this.dispatching = true;
    this.pvService.dispatch({
      arn: v.arn!,
      governmentServant: !!v.governmentServant,
      seniorCitizen: !!v.seniorCitizen,
      courtDirected: !!v.courtDirected,
      addressChangedSinceLastPassport: !!v.addressChangedSinceLastPassport,
      district: v.district!,
      state: v.state!
    }).pipe(finalize(() => (this.dispatching = false)))
      .subscribe(() => {
        this.dispatchForm.reset({
          arn: '', governmentServant: false, seniorCitizen: false, courtDirected: false,
          addressChangedSinceLastPassport: false, district: '', state: ''
        });
        this.showDispatch = false;
        this.load();
      });
  }

  startEdit(c: PvCaseResponse): void {
    this.editing = c;
    this.editForm.reset({ status: c.status, remarks: c.remarks ?? '' });
  }

  save(): void {
    if (!this.editing || this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.saving = true;
    this.pvService.updateStatus(this.editing.arn, { status: v.status!, remarks: v.remarks || null })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.editing = null;
        this.load();
      });
  }
}
