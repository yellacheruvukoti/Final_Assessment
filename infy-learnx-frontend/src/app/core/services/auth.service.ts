import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { AppRoutes } from '../constants/app-routes.constants';
import { UserRole } from '../constants/role.constants';

const STORAGE_KEY_USER_ID = 'infy_learnx.userId';
const STORAGE_KEY_ROLE = 'infy_learnx.role';
const STORAGE_KEY_PROFILE_ID = 'infy_learnx.profileId';

// Session state singleton (frontend-constitution.md Section 6.2). The only
// place userId/role/authentication status may be stored — no other service
// or component holds its own copy.
//
// userId vs. profileId: userId is the user-service login identity (also
// sent as the X-User-Id header). profileId is the domain-specific
// studentId/instructorId used by learning/registration/certification-service
// endpoints — a genuinely different ID space, confirmed live against the
// running backend (e.g. userId aaaa0001... resolves to studentId
// 5dbd0001...). profileId is null for ADMINISTRATOR, which has no such
// domain profile. Resolved once at login time by LoginService.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userIdSubject = new BehaviorSubject<string | null>(null);
  private readonly roleSubject = new BehaviorSubject<UserRole | null>(null);
  private readonly profileIdSubject = new BehaviorSubject<string | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  readonly currentUserId$: Observable<string | null> = this.userIdSubject.asObservable();
  readonly currentRole$: Observable<UserRole | null> = this.roleSubject.asObservable();
  readonly currentProfileId$: Observable<string | null> = this.profileIdSubject.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private readonly router: Router) {
    this.restoreSession();
  }

  get currentUserId(): string | null {
    return this.userIdSubject.value;
  }

  get currentRole(): UserRole | null {
    return this.roleSubject.value;
  }

  get currentProfileId(): string | null {
    return this.profileIdSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(userId: string, role: UserRole, profileId: string | null): void {
    this.setSession(userId, role, profileId);
    this.router.navigate([this.dashboardRouteFor(role)]);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate([AppRoutes.login]);
  }

  clearSession(): void {
    this.userIdSubject.next(null);
    this.roleSubject.next(null);
    this.profileIdSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    sessionStorage.removeItem(STORAGE_KEY_USER_ID);
    sessionStorage.removeItem(STORAGE_KEY_ROLE);
    sessionStorage.removeItem(STORAGE_KEY_PROFILE_ID);
  }

  private dashboardRouteFor(role: UserRole): string {
    switch (role) {
      case UserRole.STUDENT:
        return AppRoutes.student.dashboard;
      case UserRole.INSTRUCTOR:
        return AppRoutes.instructor.dashboard;
      case UserRole.ADMINISTRATOR:
        return AppRoutes.admin.dashboard;
    }
  }

  private setSession(userId: string, role: UserRole, profileId: string | null): void {
    this.userIdSubject.next(userId);
    this.roleSubject.next(role);
    this.profileIdSubject.next(profileId);
    this.isAuthenticatedSubject.next(true);
    sessionStorage.setItem(STORAGE_KEY_USER_ID, userId);
    sessionStorage.setItem(STORAGE_KEY_ROLE, role);
    if (profileId) {
      sessionStorage.setItem(STORAGE_KEY_PROFILE_ID, profileId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_PROFILE_ID);
    }
  }

  private restoreSession(): void {
    const userId = sessionStorage.getItem(STORAGE_KEY_USER_ID);
    const role = sessionStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;
    if (userId && role) {
      this.userIdSubject.next(userId);
      this.roleSubject.next(role);
      this.profileIdSubject.next(sessionStorage.getItem(STORAGE_KEY_PROFILE_ID));
      this.isAuthenticatedSubject.next(true);
    }
  }
}
