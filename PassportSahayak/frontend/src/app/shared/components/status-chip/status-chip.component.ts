import { Component, Input, OnChanges } from '@angular/core';

const SUCCESS = new Set(['CLEARED', 'PASSPORT_DELIVERED', 'RESOLVED', 'DECIDED', 'ACTIVE', 'CLOSED', 'COMPLETED', 'EMBEDDED']);
const WARNING = new Set(['ON_HOLD', 'PV_ADVERSE', 'ADVERSE', 'OVERDUE', 'ESCALATED', 'UNDER_REVIEW', 'REFERRED', 'NO_SHOW', 'PENDING']);
const DANGER = new Set(['REJECTED', 'CANCELLED', 'FAILED', 'SUPERSEDED']);
const PROGRESS = new Set([
  'SUBMITTED', 'APPOINTMENT_BOOKED', 'PSK_VISIT_COMPLETED', 'PV_DISPATCHED', 'PV_IN_PROGRESS',
  'PASSPORT_DISPATCHED', 'BOOKED', 'RESCHEDULED', 'DISPATCHED', 'ASSIGNED', 'IN_PROGRESS',
  'REPORT_RECEIVED', 'OPEN', 'REPORTED'
]);

@Component({
  selector: 'ps-status-chip',
  template: `<span class="ps-status-chip" [ngClass]="cssClass">{{ label }}</span>`
})
export class StatusChipComponent implements OnChanges {
  @Input() status = '';
  cssClass = 'ps-status-neutral';
  label = '';

  ngOnChanges(): void {
    this.label = (this.status || '').replace(/_/g, ' ');
    if (SUCCESS.has(this.status)) this.cssClass = 'ps-status-success';
    else if (WARNING.has(this.status)) this.cssClass = 'ps-status-warning';
    else if (DANGER.has(this.status)) this.cssClass = 'ps-status-danger';
    else if (PROGRESS.has(this.status)) this.cssClass = 'ps-status-progress';
    else this.cssClass = 'ps-status-neutral';
  }
}
