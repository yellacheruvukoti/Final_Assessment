import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { CourseStatus } from '../../../../core/models/course.model';

@Component({
  selector: 'app-course-catalog-filters',
  templateUrl: './course-catalog-filters.component.html',
  styleUrls: ['./course-catalog-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCatalogFiltersComponent {
  @Input() status: CourseStatus | '' = '';
  @Input() searchValue = '';

  @Output() readonly statusChange = new EventEmitter<CourseStatus | ''>();
  @Output() readonly searchSubmit = new EventEmitter<string>();
  @Output() readonly clearFilters = new EventEmitter<void>();

  readonly statusOptions = Object.values(CourseStatus);

  searchError: string | null = null;

  onStatusChange(value: string): void {
    this.statusChange.emit(value as CourseStatus | '');
  }

  onSearchSubmit(value: string): void {
    const trimmed = value.trim();
    if (trimmed.length === 1) {
      this.searchError = 'Enter at least 2 characters to search.';
      return;
    }
    this.searchError = null;
    this.searchSubmit.emit(trimmed);
  }

  onClear(): void {
    this.searchError = null;
    this.clearFilters.emit();
  }
}
