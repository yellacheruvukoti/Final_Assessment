import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CourseModuleResponse } from '../../../../core/models/module.model';

// Presentational only. Receives an already-sorted (by moduleOrder)
// module list — sorting is the parent page's responsibility since it owns
// the data source (frontend-constitution.md Section 3.1, 11.7).
@Component({
  selector: 'app-module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleListComponent {
  @Input() modules: CourseModuleResponse[] = [];
}
