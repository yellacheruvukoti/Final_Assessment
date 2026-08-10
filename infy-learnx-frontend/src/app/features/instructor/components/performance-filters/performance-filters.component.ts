import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface CourseFilterOption {
  courseId: string;
  title: string;
}

// GET /api/instructors/{id}/performance returns a course-level aggregate
// only (courseId, title, enrolledCount, averageCompletionPercentage per
// course), so this filter offers course-level filtering only.
@Component({
  selector: 'app-performance-filters',
  templateUrl: './performance-filters.component.html',
  styleUrls: ['./performance-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceFiltersComponent {
  @Input() courseOptions: CourseFilterOption[] = [];
  @Input() selectedCourseId = '';

  @Output() readonly courseChange = new EventEmitter<string>();
}
