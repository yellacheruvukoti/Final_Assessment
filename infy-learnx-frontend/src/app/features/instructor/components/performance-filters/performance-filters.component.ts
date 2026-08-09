import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface CourseFilterOption {
  courseId: string;
  title: string;
}

// KNOWN BACKEND GAP: GET /api/instructors/{id}/performance returns a
// course-level aggregate only (courseId, title, enrolledCount,
// averageCompletionPercentage per course) — there is no module-level or
// per-student breakdown anywhere in the backend (no endpoint lists a
// course's students, and progress is only fetchable one specific
// studentId at a time via GET /api/courses/{courseId}/progress/{studentId},
// with no bulk/course-wide variant). The Module filter is therefore
// rendered disabled with an explanatory note rather than wired to fake
// options; only the Course filter (real data) is functional.
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
