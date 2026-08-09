import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CreateCourseRequest,
  CreateMaterialRequest,
  CreateModuleRequest,
  UpdateCourseRequest,
} from '../../../core/models/course-request.model';
import { CourseResponse, CourseStatus } from '../../../core/models/course.model';
import { LearningMaterialResponse } from '../../../core/models/material.model';
import { CourseModuleResponse } from '../../../core/models/module.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface CourseListParams {
  status?: CourseStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// KNOWN BACKEND GAP: frontend-tasks.md F-03 specifies a `getModules`
// method (GET /api/courses/{id}/modules, listing). Verified against the
// real learning-service source: `CourseModuleService.listModules()`
// exists at the service layer but is never wired to any @GetMapping — no
// such route exists on CourseController. Deliberately NOT implemented
// here rather than calling a non-existent endpoint (would 404). Needs a
// one-line backend route addition before this method can exist; not added
// per this task's explicit "do not modify the backend" instruction.
@Injectable({ providedIn: 'root' })
export class InstructorCourseApiService {
  constructor(private readonly http: HttpClient) {}

  getCourses(params: CourseListParams = {}): Observable<CourseResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.list}`;
    return this.http
      .get<ApiResponse<CourseResponse[]>>(url, { params: toHttpParams(params) })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getCourseById(courseId: string): Observable<CourseResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.byId(courseId)}`;
    return this.http
      .get<ApiResponse<CourseResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  createCourse(request: CreateCourseRequest): Observable<CourseResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.create}`;
    return this.http
      .post<ApiResponse<CourseResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  updateCourse(courseId: string, request: UpdateCourseRequest): Observable<CourseResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.byId(courseId)}`;
    return this.http
      .put<ApiResponse<CourseResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  createModule(courseId: string, request: CreateModuleRequest): Observable<CourseModuleResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.modules(courseId)}`;
    return this.http
      .post<ApiResponse<CourseModuleResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  createMaterial(courseId: string, request: CreateMaterialRequest): Observable<LearningMaterialResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.materials(courseId)}`;
    return this.http
      .post<ApiResponse<LearningMaterialResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
