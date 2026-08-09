import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CourseResponse, CourseStatus } from '../../../core/models/course.model';
import { CourseEnrollmentResponse } from '../../../core/models/enrollment.model';
import { InstructorResponse } from '../../../core/models/instructor.model';
import { LearningMaterialResponse } from '../../../core/models/material.model';
import { LearnerProgressResponse } from '../../../core/models/progress.model';
import { QuizResponse } from '../../../core/models/quiz.model';
import { UserResponse } from '../../../core/models/user.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface CourseListParams {
  status?: CourseStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CourseQuizzesParams {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class CourseApiService {
  constructor(private readonly http: HttpClient) {}

  getCourses(params: CourseListParams = {}): Observable<CourseResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.list}`;
    return this.http.get<ApiResponse<CourseResponse[]>>(url, { params: toHttpParams(params) }).pipe(
      map(unwrapEnvelope),
      catchError(rethrowApiError),
    );
  }

  getCourseById(courseId: string): Observable<CourseResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.byId(courseId)}`;
    return this.http
      .get<ApiResponse<CourseResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getCourseMaterials(courseId: string): Observable<LearningMaterialResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.materials(courseId)}`;
    return this.http
      .get<ApiResponse<LearningMaterialResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getCourseQuizzes(courseId: string, params: CourseQuizzesParams = {}): Observable<QuizResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.quizzes(courseId)}`;
    return this.http.get<ApiResponse<QuizResponse[]>>(url, { params: toHttpParams(params) }).pipe(
      map(unwrapEnvelope),
      catchError(rethrowApiError),
    );
  }

  // Real backend shape verified live: LearnerProgressService.getProgress
  // returns List<LearnerProgressResponse> (one entry per module plus a
  // course-level entry with moduleId=null) — not the single
  // LearnerProgressResponse frontend-tasks.md's literal text implies.
  getCourseProgress(courseId: string, studentId: string): Observable<LearnerProgressResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.progress(courseId, studentId)}`;
    return this.http
      .get<ApiResponse<LearnerProgressResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getEnrollmentsForStudent(studentId: string): Observable<CourseEnrollmentResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.enrollmentsForStudent(studentId)}`;
    return this.http
      .get<ApiResponse<CourseEnrollmentResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Added so CourseCatalogPageComponent can resolve a course's raw
  // instructorId to a display name — same two-hop lookup already used by
  // AdminUserApiService/CertificateManagementPageComponent for the
  // equivalent studentId -> userId -> fullName resolution.
  getInstructorById(instructorId: string): Observable<InstructorResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.byId(instructorId)}`;
    return this.http
      .get<ApiResponse<InstructorResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getUserById(userId: string): Observable<UserResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.users.byId(userId)}`;
    return this.http.get<ApiResponse<UserResponse>>(url).pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
