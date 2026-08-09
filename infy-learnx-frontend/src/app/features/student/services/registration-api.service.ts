import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CreateRegistrationRequest } from '../../../core/models/registration-request.model';
import { RegistrationResponse } from '../../../core/models/registration.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface StudentRegistrationsParams {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationApiService {
  constructor(private readonly http: HttpClient) {}

  getStudentRegistrations(
    studentId: string,
    params: StudentRegistrationsParams = {},
  ): Observable<RegistrationResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.students.registrations(studentId)}`;
    return this.http
      .get<ApiResponse<RegistrationResponse[]>>(url, { params: toHttpParams(params) })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  registerForAssessment(request: CreateRegistrationRequest): Observable<RegistrationResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.registrations.create}`;
    return this.http
      .post<ApiResponse<RegistrationResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Backend endpoints take no request body — path variable only.
  cancelRegistration(registrationId: string): Observable<RegistrationResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.registrations.cancel(registrationId)}`;
    return this.http
      .patch<ApiResponse<RegistrationResponse>>(url, null)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  reRegisterForAssessment(registrationId: string): Observable<RegistrationResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.registrations.reregister(registrationId)}`;
    return this.http
      .patch<ApiResponse<RegistrationResponse>>(url, null)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
