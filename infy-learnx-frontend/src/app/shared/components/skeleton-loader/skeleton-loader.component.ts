import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type SkeletonLoaderType = 'table' | 'card' | 'form';

// Presentational only — no service calls, no state beyond its own input
// (frontend-constitution.md Section 3.1, 11.2).
@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonLoaderType = 'table';

  readonly tableRows = [0, 1, 2];
  readonly formBlocks = [0, 1, 2, 3];
}
