import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';

import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { UserRole } from '../../../core/constants/role.constants';
import { ApiError, ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  role: UserRole;
}

// Minimal shapes of the by-user profile-resolution responses — only the
// one field this flow needs from each.
interface StudentProfileResponse {
  studentId: string;
}

interface InstructorProfileResponse {
  instructorId: string;
}

// Feature-scoped: only the auth flow needs LoginRequest/LoginResponse, so
// they live here rather than in core/models (frontend-constitution.md
// Section 5.1.2).
@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  login(request: LoginRequest): Observable<void> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.auth.login}`;
    return this.http.post<ApiResponse<LoginResponse>>(url, request).pipe(
      switchMap((response) => {
        if (!response.success || !response.data) {
          return throwError(() => response.error);
        }
        const { userId, role } = response.data;
        return this.resolveProfileId(userId, role).pipe(
          switchMap((profileId) => {
            this.authService.login(userId, role, profileId);
            return of(undefined);
          }),
        );
      }),
      catchError((error: HttpErrorResponse | ApiError) => {
        const apiError: ApiError | undefined = (error as HttpErrorResponse).error?.error;
        return throwError(() => apiError ?? error);
      }),
    );
  }

  // userId (the login identity) is a different ID space from the
  // studentId/instructorId used by domain endpoints (verified live against
  // the running backend — see AuthService's doc comment). ADMINISTRATOR has
  // no such profile, so it resolves to null directly.
  private resolveProfileId(userId: string, role: UserRole): Observable<string | null> {
    if (role === UserRole.STUDENT) {
      const url = `${environment.apiBaseUrl}/${ApiRoutes.students.byUser(userId)}`;
      return this.http
        .get<ApiResponse<StudentProfileResponse>>(url)
        .pipe(switchMap((res) => of(res.data?.studentId ?? null)));
    }
    if (role === UserRole.INSTRUCTOR) {
      const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.byUser(userId)}`;
      return this.http
        .get<ApiResponse<InstructorProfileResponse>>(url)
        .pipe(switchMap((res) => of(res.data?.instructorId ?? null)));
    }
    return of(null);
  }
}
