import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { UserRole } from '../../../core/constants/role.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { BatchResponse, CreateBatchRequest } from '../../../core/models/batch.model';
import { InstructorResponse } from '../../../core/models/instructor.model';
import { StudentResponse } from '../../../core/models/student.model';
import {
  CreateInstructorRequest,
  CreateStudentRequest,
  UpdateInstructorRequest,
  UpdateStudentRequest,
} from '../../../core/models/user-request.model';
import { UserResponse, UserStatus } from '../../../core/models/user.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface UserListParams {
  role?: UserRole;
  status?: UserStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminUserApiService {
  constructor(private readonly http: HttpClient) {}

  getUsers(params: UserListParams = {}): Observable<UserResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.users.list}`;
    return this.http
      .get<ApiResponse<UserResponse[]>>(url, { params: toHttpParams(params) })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getUserById(userId: string): Observable<UserResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.users.byId(userId)}`;
    return this.http.get<ApiResponse<UserResponse>>(url).pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Added for CertificateManagementPageComponent's student-name enrichment:
  // CertificateResponse only carries a bare studentId (registration/
  // certification-domain id), which must be resolved to a userId here
  // before a display name can be looked up via getUserById — see
  // [[infy_learnx_userid_vs_profileid]] for the general studentId/userId
  // split this reflects.
  getStudentById(studentId: string): Observable<StudentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.students.byId(studentId)}`;
    return this.http.get<ApiResponse<StudentResponse>>(url).pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Resolves a row's bare userId (all UserManagementPageComponent has) to
  // the studentId the mutation endpoints are keyed on.
  getStudentByUserId(userId: string): Observable<StudentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.students.byUser(userId)}`;
    return this.http.get<ApiResponse<StudentResponse>>(url).pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Same userId -> instructorId resolution as getStudentByUserId, for the
  // INSTRUCTOR role.
  getInstructorByUserId(userId: string): Observable<InstructorResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.byUser(userId)}`;
    return this.http
      .get<ApiResponse<InstructorResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  createStudent(request: CreateStudentRequest): Observable<StudentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.students.create}`;
    return this.http
      .post<ApiResponse<StudentResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  updateStudent(studentId: string, request: UpdateStudentRequest): Observable<StudentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.students.update(studentId)}`;
    return this.http
      .patch<ApiResponse<StudentResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Not unwrapEnvelope: deactivation's ApiResponse.data is always null on
  // success, and unwrapEnvelope treats null data as a failure signal.
  deactivateStudent(studentId: string): Observable<void> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.students.deactivate(studentId)}`;
    return this.http
      .delete<ApiResponse<void>>(url)
      .pipe(map(() => undefined), catchError(rethrowApiError));
  }

  createInstructor(request: CreateInstructorRequest): Observable<InstructorResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.create}`;
    return this.http
      .post<ApiResponse<InstructorResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getInstructorById(instructorId: string): Observable<InstructorResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.byId(instructorId)}`;
    return this.http
      .get<ApiResponse<InstructorResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  updateInstructor(instructorId: string, request: UpdateInstructorRequest): Observable<InstructorResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.update(instructorId)}`;
    return this.http
      .patch<ApiResponse<InstructorResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Not unwrapEnvelope: deactivation's ApiResponse.data is always null on
  // success, and unwrapEnvelope treats null data as a failure signal.
  deactivateInstructor(instructorId: string): Observable<void> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.deactivate(instructorId)}`;
    return this.http
      .delete<ApiResponse<void>>(url)
      .pipe(map(() => undefined), catchError(rethrowApiError));
  }

  getBatches(): Observable<BatchResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.batches.list}`;
    return this.http
      .get<ApiResponse<BatchResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  createBatch(request: CreateBatchRequest): Observable<BatchResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.batches.list}`;
    return this.http
      .post<ApiResponse<BatchResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
