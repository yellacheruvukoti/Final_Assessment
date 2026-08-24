import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * AuthService injects HttpClient, and HttpClient's construction resolves every registered
 * HTTP_INTERCEPTORS - so injecting AuthService directly in this constructor creates a
 * circular dependency (NG0200). Injector defers the lookup until intercept() actually runs,
 * by which point HttpClient is already fully constructed.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.injector.get(AuthService).token;
    if (!token) {
      return next.handle(req);
    }
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(cloned);
  }
}
