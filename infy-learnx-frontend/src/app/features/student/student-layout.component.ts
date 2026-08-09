import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { AppRoutes } from '../../core/constants/app-routes.constants';
import { UserRole } from '../../core/constants/role.constants';
import { AuthService } from '../../core/services/auth.service';
import { SidebarNavItem } from '../../shared/components/sidebar-nav/sidebar-nav.component';

// Parent shell for every /student/** route (frontend-tasks.md D-02).
// Sidebar nav items are limited to parameter-free, top-level list pages —
// course-scoped student routes (materials, quizzes for a specific course)
// are reached by drilling into a course, not from the sidebar.
//
// Deliberately NOT OnPush: this component hosts every routed page via
// <router-outlet>, and an OnPush ancestor that isn't itself marked dirty
// blocks Angular from checking its routed children at all — including
// when a child's data arrives via an async HTTP response, which doesn't
// originate from a click inside THIS component's own template. That
// silently broke every page under /student/** (data loaded into memory
// but the view never re-rendered until some unrelated click inside the
// page happened to mark the path dirty) — confirmed live 2026-08-09, see
// project memory.
@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss'],
})
export class StudentLayoutComponent {
  readonly navItems: SidebarNavItem[] = [
    { label: 'Dashboard', route: AppRoutes.student.dashboard },
    { label: 'Courses', route: AppRoutes.student.courses },
    { label: 'My Progress', route: AppRoutes.student.progress },
    { label: 'Assessments', route: AppRoutes.student.assessments },
    { label: 'Registrations', route: AppRoutes.student.registrations },
    { label: 'Certificates', route: AppRoutes.student.certificates },
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
