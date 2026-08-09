import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { UserRole } from '../constants/role.constants';
import { AppRoutes } from '../constants/app-routes.constants';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    sessionStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('starts unauthenticated with no session in storage', () => {
    expect(service.isAuthenticated).toBe(false);
    expect(service.currentUserId).toBeNull();
    expect(service.currentRole).toBeNull();
    expect(service.currentProfileId).toBeNull();
  });

  describe('login()', () => {
    it('sets session state, persists to sessionStorage, and navigates to the role dashboard', () => {
      service.login('u1', UserRole.STUDENT, 's1');

      expect(service.isAuthenticated).toBe(true);
      expect(service.currentUserId).toBe('u1');
      expect(service.currentRole).toBe(UserRole.STUDENT);
      expect(service.currentProfileId).toBe('s1');
      expect(sessionStorage.getItem('infy_learnx.userId')).toBe('u1');
      expect(sessionStorage.getItem('infy_learnx.role')).toBe(UserRole.STUDENT);
      expect(sessionStorage.getItem('infy_learnx.profileId')).toBe('s1');
      expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoutes.student.dashboard]);
    });

    it('navigates to the instructor dashboard for INSTRUCTOR', () => {
      service.login('u2', UserRole.INSTRUCTOR, 'i1');
      expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoutes.instructor.dashboard]);
    });

    it('navigates to the admin dashboard for ADMINISTRATOR', () => {
      service.login('u3', UserRole.ADMINISTRATOR, null);
      expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoutes.admin.dashboard]);
    });

    it('stores a null profileId without writing a profileId key to sessionStorage', () => {
      service.login('u3', UserRole.ADMINISTRATOR, null);
      expect(service.currentProfileId).toBeNull();
      expect(sessionStorage.getItem('infy_learnx.profileId')).toBeNull();
    });
  });

  describe('logout()', () => {
    it('clears session state, removes sessionStorage entries, and navigates to login', () => {
      service.login('u1', UserRole.STUDENT, 's1');
      routerSpy.navigate.calls.reset();

      service.logout();

      expect(service.isAuthenticated).toBe(false);
      expect(service.currentUserId).toBeNull();
      expect(service.currentProfileId).toBeNull();
      expect(sessionStorage.getItem('infy_learnx.userId')).toBeNull();
      expect(sessionStorage.getItem('infy_learnx.role')).toBeNull();
      expect(sessionStorage.getItem('infy_learnx.profileId')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoutes.login]);
    });
  });

  describe('clearSession()', () => {
    it('clears state without navigating', () => {
      service.login('u1', UserRole.STUDENT, 's1');
      routerSpy.navigate.calls.reset();

      service.clearSession();

      expect(service.isAuthenticated).toBe(false);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('session restoration on init', () => {
    it('restores userId/role/profileId/isAuthenticated from sessionStorage', () => {
      sessionStorage.setItem('infy_learnx.userId', 'u9');
      sessionStorage.setItem('infy_learnx.role', UserRole.INSTRUCTOR);
      sessionStorage.setItem('infy_learnx.profileId', 'i9');

      // AuthService is providedIn: 'root' and lazily constructed on first
      // inject — the outer beforeEach already created one against empty
      // storage, so a fresh TestBed module is needed to force the
      // constructor to re-run restoreSession() against the storage set
      // above.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [AuthService, { provide: Router, useValue: routerSpy }],
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.isAuthenticated).toBe(true);
      expect(freshService.currentUserId).toBe('u9');
      expect(freshService.currentRole).toBe(UserRole.INSTRUCTOR);
      expect(freshService.currentProfileId).toBe('i9');
    });

    it('leaves the service unauthenticated when sessionStorage has no userId/role', () => {
      expect(service.isAuthenticated).toBe(false);
    });
  });
});
