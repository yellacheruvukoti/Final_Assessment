import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface SummaryCardState {
  isLoading: boolean;
  hasError: boolean;
  value: number | null;
  // Set when the underlying data has no honest backend source at all
  // (distinct from a transient hasError — retrying would not help).
  isUnavailable?: boolean;
}

// Reusable independently-loadable dashboard card (I-04). Each card owns its
// own loading/error/value state so one failed card never affects the
// others (frontend-tasks.md I-04 acceptance criteria).
@Component({
  selector: 'app-instructor-summary-card',
  templateUrl: './instructor-summary-card.component.html',
  styleUrls: ['./instructor-summary-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorSummaryCardComponent {
  @Input({ required: true }) cardTitle!: string;
  @Input({ required: true }) state!: SummaryCardState;
  @Input() unavailableMessage = 'Not available.';

  @Output() readonly retry = new EventEmitter<void>();
}
