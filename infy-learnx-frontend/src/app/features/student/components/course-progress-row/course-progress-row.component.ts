import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LearnerProgressResponse } from '../../../../core/models/progress.model';

export interface CourseProgressGroup {
  courseId: string;
  courseTitle: string;
  overallPercentage: number;
  moduleProgress: LearnerProgressResponse[];
}

@Component({
  selector: 'app-course-progress-row',
  templateUrl: './course-progress-row.component.html',
  styleUrls: ['./course-progress-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseProgressRowComponent {
  @Input({ required: true }) group!: CourseProgressGroup;
  @Input() isExpanded = false;

  @Output() readonly toggleExpand = new EventEmitter<void>();
}
