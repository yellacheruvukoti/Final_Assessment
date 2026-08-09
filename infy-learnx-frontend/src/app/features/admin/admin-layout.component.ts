import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { AppRoutes } from '../../core/constants/app-routes.constants';
import { UserRole } from '../../core/constants/role.constants';
import { AuthService } from '../../core/services/auth.service';
import { SidebarNavItem } from '../../shared/components/sidebar-nav/sidebar-nav.component';

// Parent shell for every /admin/** route (frontend-tasks.md D-02).
//
// Deliberately NOT OnPush — see StudentLayoutComponent's doc comment for
// why: an OnPush ancestor blocks change detection from ever reaching its
// routed children's async-loaded data.
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  readonly navItems: SidebarNavItem[] = [
    { label: 'Dashboard', route: AppRoutes.admin.dashboard },
    { label: 'Users', route: AppRoutes.admin.users },
    { label: 'Certificates', route: AppRoutes.admin.certificates },
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
