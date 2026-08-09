import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type SummaryTabId = 'overview' | 'byAssessment' | 'byStatus';

// Presentational tab switcher only — RegistrationSummaryPageComponent owns
// the actual per-tab data and lazy-load-on-first-activation logic
// (frontend-constitution.md Section 3.1, 11.7).
@Component({
  selector: 'app-summary-tabs',
  templateUrl: './summary-tabs.component.html',
  styleUrls: ['./summary-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryTabsComponent {
  @Input() activeTab: SummaryTabId = 'overview';
  @Output() readonly tabChange = new EventEmitter<SummaryTabId>();
}
