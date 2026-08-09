import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';

export interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: string;
  direction: SortDirection;
}

// Generic reusable table (frontend-constitution.md Section 11.1). Loading,
// empty, and populated states are handled internally; the parent supplies
// data plus an optional row-actions <ng-template> for View/Edit/Cancel/
// Download buttons — never hardcoded here.
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = Record<string, unknown>> {
  @Input() columns: DataTableColumn[] = [];
  @Input() rows: T[] = [];
  @Input() isLoading = false;
  @Input() emptyMessage = 'No data available.';
  @Input() currentSort: SortState | null = null;
  @Input() totalElements = 0;
  @Input() totalPages = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;

  @Output() readonly sortChange = new EventEmitter<SortState>();
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly pageSizeChange = new EventEmitter<number>();

  @ContentChild(TemplateRef) actionsTemplate?: TemplateRef<{ $implicit: T }>;

  cellValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  sortIndicator(column: DataTableColumn): '▲' | '▼' | '' {
    if (!column.sortable || !this.currentSort || this.currentSort.field !== column.key) {
      return '';
    }
    return this.currentSort.direction === 'asc' ? '▲' : '▼';
  }

  onHeaderClick(column: DataTableColumn): void {
    if (!column.sortable) {
      return;
    }
    const isSameField = this.currentSort?.field === column.key;
    const nextDirection: SortDirection =
      isSameField && this.currentSort?.direction === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field: column.key, direction: nextDirection });
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }
}
