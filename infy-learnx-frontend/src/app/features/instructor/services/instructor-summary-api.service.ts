import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AssessmentWiseSummaryResponse,
  RegistrationSummaryResponse,
} from '../../../core/models/summary.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class InstructorSummaryApiService {
  constructor(private readonly http: HttpClient) {}

  getBatchSummary(batchId: string): Observable<RegistrationSummaryResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.summaries.batch(batchId)}`;
    return this.http
      .get<ApiResponse<RegistrationSummaryResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getAssessmentSummary(batchId: string): Observable<AssessmentWiseSummaryResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.summaries.byAssessment(batchId)}`;
    return this.http
      .get<ApiResponse<AssessmentWiseSummaryResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getStatusSummary(batchId: string): Observable<RegistrationSummaryResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.summaries.byStatus(batchId)}`;
    return this.http
      .get<ApiResponse<RegistrationSummaryResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
