import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface SidebarNavItem {
  label: string;
  route: string;
}

// Presentational only (frontend-constitution.md Section 3.1, 11.8). The
// mobile/desktop drawer behavior is pure CSS (mobile-first, min-width) —
// `isOpen` only matters below the tablet breakpoint; above it the sidebar
// is always visible regardless of this input's value.
@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavComponent {
  @Input() navItems: SidebarNavItem[] = [];
  @Input() isOpen = false;

  @Output() readonly closeRequested = new EventEmitter<void>();

  onNavItemClick(): void {
    this.closeRequested.emit();
  }

  onBackdropClick(): void {
    this.closeRequested.emit();
  }
}
