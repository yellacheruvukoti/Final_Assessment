import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { LearnerProgressResponse } from '../../../core/models/progress.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';

// Real backend shape verified live: returns an array (one entry per
// module plus a course-level entry with moduleId=null), not a single
// LearnerProgressResponse as frontend-tasks.md's literal text implies —
// see CourseApiService.getCourseProgress for the same, verified detail.
@Injectable({ providedIn: 'root' })
export class ProgressApiService {
  constructor(private readonly http: HttpClient) {}

  getProgress(courseId: string, studentId: string): Observable<LearnerProgressResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.progress(courseId, studentId)}`;
    return this.http
      .get<ApiResponse<LearnerProgressResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
