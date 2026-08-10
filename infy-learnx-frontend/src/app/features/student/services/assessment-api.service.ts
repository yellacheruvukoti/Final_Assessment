import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { AssessmentResponse } from '../../../core/models/assessment.model';
import { rethrowApiError, unwrapEnvelope, unwrapPagedEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface UpcomingAssessmentsParams {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentApiService {
  constructor(private readonly http: HttpClient) {}

  getUpcomingAssessments(
    params: UpcomingAssessmentsParams = {},
  ): Observable<PagedResult<AssessmentResponse>> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.upcoming}`;
    return this.http
      .get<ApiResponse<AssessmentResponse[]>>(url, { params: toHttpParams(params) })
      .pipe(map(unwrapPagedEnvelope), catchError(rethrowApiError));
  }

  // Added beyond F-02's original 1-method spec: MyRegistrationsPageComponent
  // (I-03) needs assessment title/startTime to display and to compute
  // canCancel/canReRegister, but RegistrationResponse only carries
  // assessmentId. GET /api/assessments/{id} is a general read endpoint,
  // not instructor-restricted, so it belongs here rather than reaching
  // into InstructorAssessmentApiService.
  getAssessmentById(assessmentId: string): Observable<AssessmentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.byId(assessmentId)}`;
    return this.http
      .get<ApiResponse<AssessmentResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Reused by Course Details to find the COURSE-scoped assessment(s)
  // belonging to a given course (client-side filter by scopeType/scopeId —
  // no course-filtered assessment endpoint exists, same GET /api/assessments
  // already used elsewhere).
  getAssessments(): Observable<AssessmentResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.list}`;
    return this.http
      .get<ApiResponse<AssessmentResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
