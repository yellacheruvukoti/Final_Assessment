import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { AppRoutes } from '../../core/constants/app-routes.constants';
import { UserRole } from '../../core/constants/role.constants';
import { AuthService } from '../../core/services/auth.service';
import { SidebarNavItem } from '../../shared/components/sidebar-nav/sidebar-nav.component';

// Parent shell for every /instructor/** route (frontend-tasks.md D-02).
// Sidebar nav covers the parameter-free top-level list pages only.
// Course-scoped routes (modules, content upload, quiz management for a
// specific course) are reached by drilling into a course from Courses, not
// from the sidebar. Registration Summary (/instructor/summary/:batchId)
// requires a batchId with no batch-selector page yet in this route set, so
// it isn't a sidebar entry either — it'll be linked to once I-05 builds
// that page's batch selector.
//
// Deliberately NOT OnPush — see StudentLayoutComponent's doc comment for
// why: an OnPush ancestor blocks change detection from ever reaching its
// routed children's async-loaded data.
@Component({
  selector: 'app-instructor-layout',
  templateUrl: './instructor-layout.component.html',
  styleUrls: ['./instructor-layout.component.scss'],
})
export class InstructorLayoutComponent {
  readonly navItems: SidebarNavItem[] = [
    { label: 'Dashboard', route: AppRoutes.instructor.dashboard },
    { label: 'Courses', route: AppRoutes.instructor.courses },
    { label: 'Assessments', route: AppRoutes.instructor.assessments },
    { label: 'Performance', route: AppRoutes.instructor.performance },
  ];

  isSidebarOpen = false;

  readonly role$: Observable<UserRole | null> = this.authService.currentRole$;

  constructor(private readonly authService: AuthService) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onSidebarCloseRequested(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
