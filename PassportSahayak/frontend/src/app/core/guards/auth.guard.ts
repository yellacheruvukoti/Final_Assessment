import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isLoggedIn) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = (route.data['roles'] as string[]) ?? [];
    const user = this.auth.currentUser;
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }
    return this.router.createUrlTree([this.homeForRole(user?.role)]);
  }

  private homeForRole(role?: string): string {
    if (role === 'APPLICANT') return '/applicant';
    if (role === 'ADMIN') return '/admin/kb';
    if (role === 'PSK_OFFICIAL' || role === 'RPO_OFFICIAL') return '/official';
    return '/auth/login';
  }
}
