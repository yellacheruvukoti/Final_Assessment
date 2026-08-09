import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { AssessmentResponse } from '../../../../core/models/assessment.model';

// Attribute selector so this renders as real <tr> cells inside a semantic
// <table> (frontend-constitution.md Section 13.5) — used as
// <tr app-assessment-row ...></tr>, not as its own standalone element.
@Component({
  selector: '[app-assessment-row]',
  templateUrl: './assessment-row.component.html',
  styleUrls: ['./assessment-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentRowComponent {
  @Input({ required: true }) assessment!: AssessmentResponse;
  @Input() isRegistered = false;
  @Input() isRegistering = false;

  @Output() readonly register = new EventEmitter<void>();
}
