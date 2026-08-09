import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface Breadcrumb {
  label: string;
  route: string;
}

// Presentational only (frontend-constitution.md Section 3.1, 11.7).
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input() pageTitle = '';
  @Input() breadcrumbs: Breadcrumb[] = [];
}
