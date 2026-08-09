import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

import { AppRoutes } from '../constants/app-routes.constants';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

// Centralized error handling (frontend-constitution.md Section 9.1-9.2).
// Never swallows an error — every branch re-throws so page-level
// catchError can still run.
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          this.handle(error);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.authService.clearSession();
      this.router.navigate([AppRoutes.login]);
      this.notificationService.showError('Your session has expired. Please log in again.');
      return;
    }

    if (error.status === 503) {
      this.notificationService.showError(
        'This feature is temporarily unavailable. Please try again shortly.',
      );
      return;
    }

    if (error.status >= 500) {
      this.notificationService.showError('Something went wrong. Please try again.');
      return;
    }

    // 400/403/404/409/422 pass through untouched — the page-level
    // catchError handles these (form errors, access-denied messages, etc).
  }
}
