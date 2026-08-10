import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
} from '../../../core/models/assessment-request.model';
import { AssessmentResponse, AssessmentStatus } from '../../../core/models/assessment.model';
import { BatchResponse } from '../../../core/models/batch.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface AssessmentListParams {
  status?: AssessmentStatus;
}

@Injectable({ providedIn: 'root' })
export class InstructorAssessmentApiService {
  constructor(private readonly http: HttpClient) {}

  // Real backend only accepts a `status` query param — no page/size/sort.
  getAssessments(params: AssessmentListParams = {}): Observable<AssessmentResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.list}`;
    return this.http
      .get<ApiResponse<AssessmentResponse[]>>(url, { params: toHttpParams(params) })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getAssessmentById(assessmentId: string): Observable<AssessmentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.byId(assessmentId)}`;
    return this.http
      .get<ApiResponse<AssessmentResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  createAssessment(request: CreateAssessmentRequest): Observable<AssessmentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.create}`;
    return this.http
      .post<ApiResponse<AssessmentResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  updateAssessment(assessmentId: string, request: UpdateAssessmentRequest): Observable<AssessmentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.byId(assessmentId)}`;
    return this.http
      .put<ApiResponse<AssessmentResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Dynamic Batch dropdown source for scopeType=BATCH — reuses the same
  // GET /api/batches endpoint the Admin batch pickers already use.
  getBatches(): Observable<BatchResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.batches.list}`;
    return this.http
      .get<ApiResponse<BatchResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
