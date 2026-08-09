import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// Presentational only (frontend-constitution.md Section 3.1, 11.6).
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() message = 'No data available.';
}
