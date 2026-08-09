import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AssessmentResponse } from '../../../core/models/assessment.model';
import { CertificateResponse, CertificateStatus } from '../../../core/models/certificate.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface CertificateListParams {
  status?: CertificateStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminCertificateApiService {
  constructor(private readonly http: HttpClient) {}

  getCertificates(params: CertificateListParams = {}): Observable<CertificateResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.certificates.list}`;
    return this.http
      .get<ApiResponse<CertificateResponse[]>>(url, { params: toHttpParams(params) })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Backend endpoint takes no request body — path variable only.
  revokeCertificate(certificateId: string): Observable<CertificateResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.certificates.revoke(certificateId)}`;
    return this.http
      .patch<ApiResponse<CertificateResponse>>(url, null)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Added for CertificateManagementPageComponent's assessment-title
  // enrichment: CertificateResponse only carries a bare assessmentId. A
  // general, non-role-restricted read, so it belongs here rather than
  // reaching into a student/instructor feature service.
  getAssessmentById(assessmentId: string): Observable<AssessmentResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.assessments.byId(assessmentId)}`;
    return this.http
      .get<ApiResponse<AssessmentResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
