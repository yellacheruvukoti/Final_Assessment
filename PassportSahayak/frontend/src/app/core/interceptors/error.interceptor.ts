import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * AuthService injects HttpClient, and HttpClient's construction resolves every registered
 * HTTP_INTERCEPTORS - so injecting AuthService directly in this constructor creates a
 * circular dependency (NG0200). Injector defers the lookup until intercept() actually runs,
 * by which point HttpClient is already fully constructed.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar, private router: Router, private injector: Injector) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const message = this.extractMessage(err);

        if (err.status === 401) {
          this.injector.get(AuthService).logout();
          this.router.navigate(['/auth/login']);
        }

        this.snackBar.open(message, 'Dismiss', { duration: 5000, panelClass: 'ps-snack-error' });
        return throwError(() => err);
      })
    );
  }

  private extractMessage(err: HttpErrorResponse): string {
    if (err.error && typeof err.error === 'object' && 'message' in err.error) {
      return String((err.error as { message: unknown }).message);
    }
    if (err.status === 0) {
      return 'Cannot reach the server. Please check your connection.';
    }
    return `Request failed (HTTP ${err.status})`;
  }
}
