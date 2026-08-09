import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../../core/constants/pagination.constants';

// Presentational only (frontend-constitution.md Section 3.1, 11.5).
// currentPage is 1-based for display; pageChange emits 0-based for the API.
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() totalElements = 0;
  @Input() totalPages = 0;
  @Input() currentPage = 1;
  @Input() pageSize = DEFAULT_PAGE_SIZE;
  @Input() pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;

  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly pageSizeChange = new EventEmitter<number>();

  get isPreviousDisabled(): boolean {
    return this.currentPage <= 1;
  }

  get isNextDisabled(): boolean {
    return this.currentPage >= this.totalPages;
  }

  get summaryText(): string {
    if (this.totalElements === 0) {
      return 'Showing 0 of 0 results';
    }
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalElements);
    return `Showing ${start}–${end} of ${this.totalElements} results`;
  }

  onPrevious(): void {
    if (this.isPreviousDisabled) {
      return;
    }
    this.pageChange.emit(this.currentPage - 2);
  }

  onNext(): void {
    if (this.isNextDisabled) {
      return;
    }
    this.pageChange.emit(this.currentPage);
  }

  onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }
}
