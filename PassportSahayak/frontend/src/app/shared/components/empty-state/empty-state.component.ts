import { Component, Input } from '@angular/core';

@Component({
  selector: 'ps-empty-state',
  template: `
    <div class="ps-empty-state">
      <mat-icon>{{ icon }}</mat-icon>
      <div>{{ title }}</div>
      <div *ngIf="subtitle" style="font-size:12.5px; margin-top:4px;">{{ subtitle }}</div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() subtitle?: string;
}
