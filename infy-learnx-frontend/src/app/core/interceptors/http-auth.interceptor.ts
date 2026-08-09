import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiRoutes } from '../constants/api-routes.constants';
import { AuthService } from '../services/auth.service';

const BODY_METHODS = ['POST', 'PUT', 'PATCH'];

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(environment.apiBaseUrl)) {
      return next.handle(request);
    }

    let headers = request.headers.set('X-Correlation-Id', crypto.randomUUID());

    const role = this.authService.currentRole;
    if (role) {
      headers = headers.set('X-Role', role);
    }

    const userId = this.authService.currentUserId;
    if (userId) {
      headers = headers.set('X-User-Id', userId);
    }

    if (BODY_METHODS.includes(request.method)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    if (request.method === 'POST' && this.isRegistrationCreate(request.url)) {
      headers = headers.set('Idempotency-Key', crypto.randomUUID());
    }

    return next.handle(request.clone({ headers }));
  }

  private isRegistrationCreate(url: string): boolean {
    return url === `${environment.apiBaseUrl}/${ApiRoutes.registrations.create}`;
  }
}
