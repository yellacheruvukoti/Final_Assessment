import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AppRoutes } from '../constants/app-routes.constants';
import { UserRole } from '../constants/role.constants';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService> & { currentRole$: Observable<UserRole | null> };
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function makeRoute(requiredRole: UserRole): ActivatedRouteSnapshot {
    return { data: { requiredRole } } as unknown as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentRole$: of(UserRole.STUDENT) });
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('allows navigation when the role matches', (done) => {
    guard.canActivate(makeRoute(UserRole.STUDENT)).subscribe((result) => {
      expect(result).toBe(true);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(notificationServiceSpy.showError).not.toHaveBeenCalled();
      done();
    });
  });

  it('blocks navigation, shows an error, and redirects to the role dashboard on mismatch', (done) => {
    guard.canActivate(makeRoute(UserRole.INSTRUCTOR)).subscribe((result) => {
      expect(result).toBe(false);
      expect(notificationServiceSpy.showError).toHaveBeenCalledWith('You do not have access to that page.');
      expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoutes.student.dashboard]);
      done();
    });
  });
});
