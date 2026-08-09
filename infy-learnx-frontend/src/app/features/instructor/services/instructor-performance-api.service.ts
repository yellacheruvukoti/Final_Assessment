import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';

export interface CoursePerformanceItem {
  courseId: string;
  title: string;
  enrolledCount: number;
  averageCompletionPercentage: number;
}

// Real backend shape verified live against learning-service's
// InstructorPerformanceController: a single pre-aggregated dashboard
// object, NOT `PagedResult<LearnerProgressResponse>` as frontend-tasks.md
// F-03 assumes. There is no student-level, module-level, or filterable
// breakdown here — no course/module/status query params exist on this
// endpoint either. If a per-student performance table is needed later
// (I-05's LearnerPerformancePageComponent), this endpoint cannot supply
// it as designed; that's a gap for whoever builds that page to resolve.
export interface InstructorPerformanceResponse {
  instructorId: string;
  totalCourses: number;
  totalStudents: number;
  averageCompletionPercentage: number;
  courses: CoursePerformanceItem[];
}

@Injectable({ providedIn: 'root' })
export class InstructorPerformanceApiService {
  constructor(private readonly http: HttpClient) {}

  getPerformance(instructorId: string): Observable<InstructorPerformanceResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.instructors.performance(instructorId)}`;
    return this.http
      .get<ApiResponse<InstructorPerformanceResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
