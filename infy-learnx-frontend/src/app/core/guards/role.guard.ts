import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';

import { AppRoutes } from '../constants/app-routes.constants';
import { UserRole } from '../constants/role.constants';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRole = route.data['requiredRole'] as UserRole | undefined;

    return this.authService.currentRole$.pipe(
      take(1),
      map((currentRole) => {
        if (!requiredRole || currentRole === requiredRole) {
          return true;
        }
        this.notificationService.showError('You do not have access to that page.');
        this.router.navigate([this.dashboardRouteFor(currentRole)]);
        return false;
      }),
    );
  }

  private dashboardRouteFor(role: UserRole | null): string {
    switch (role) {
      case UserRole.STUDENT:
        return AppRoutes.student.dashboard;
      case UserRole.INSTRUCTOR:
        return AppRoutes.instructor.dashboard;
      case UserRole.ADMINISTRATOR:
        return AppRoutes.admin.dashboard;
      default:
        return AppRoutes.login;
    }
  }
}
