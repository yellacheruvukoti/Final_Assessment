import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AppRoutes } from '../constants/app-routes.constants';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['clearSession']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function triggerError(status: number): Promise<HttpErrorResponse> {
    return new Promise((resolve) => {
      http.get('/api/test').subscribe({
        error: (err: HttpErrorResponse) => resolve(err),
      });
      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status, statusText: 'Error' });
    });
  }

  it('401: clears session, navigates to login, shows the session-expired toast, and re-throws', async () => {
    const error = await triggerError(401);
    expect(authServiceSpy.clearSession).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoutes.login]);
    expect(notificationServiceSpy.showError).toHaveBeenCalledWith(
      'Your session has expired. Please log in again.',
    );
    expect(error.status).toBe(401);
  });

  it('503: shows the temporarily-unavailable toast and re-throws', async () => {
    const error = await triggerError(503);
    expect(notificationServiceSpy.showError).toHaveBeenCalledWith(
      'This feature is temporarily unavailable. Please try again shortly.',
    );
    expect(authServiceSpy.clearSession).not.toHaveBeenCalled();
    expect(error.status).toBe(503);
  });

  it('other 5xx (500): shows the generic error toast and re-throws', async () => {
    const error = await triggerError(500);
    expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Something went wrong. Please try again.');
    expect(error.status).toBe(500);
  });

  for (const status of [400, 403, 404, 409, 422]) {
    it(`${status}: passes through without a toast, re-throws for page-level handling`, async () => {
      const error = await triggerError(status);
      expect(notificationServiceSpy.showError).not.toHaveBeenCalled();
      expect(authServiceSpy.clearSession).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(error.status).toBe(status);
    });
  }
});
