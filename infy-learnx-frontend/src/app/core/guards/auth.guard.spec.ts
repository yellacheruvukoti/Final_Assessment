import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AppRoutes } from '../constants/app-routes.constants';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  function setup(isAuthenticated: boolean) {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(isAuthenticated),
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    return { guard: TestBed.inject(AuthGuard), routerSpy };
  }

  it('allows navigation when authenticated', (done) => {
    const { guard, routerSpy } = setup(true);

    guard.canActivate().subscribe((result) => {
      expect(result).toBe(true);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('redirects to login and blocks navigation when unauthenticated', (done) => {
    const { guard, routerSpy } = setup(false);

    guard.canActivate().subscribe((result) => {
      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoutes.login]);
      done();
    });
  });
});
