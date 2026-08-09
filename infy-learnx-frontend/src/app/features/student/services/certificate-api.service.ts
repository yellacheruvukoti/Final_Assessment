import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CertificateDownloadResponse, CertificateResponse } from '../../../core/models/certificate.model';
import { IssueCertificateRequest } from '../../../core/models/certificate-request.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';
import { toHttpParams } from '../../../shared/utils/http-params.util';

export interface StudentCertificatesParams {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class CertificateApiService {
  constructor(private readonly http: HttpClient) {}

  getStudentCertificates(
    studentId: string,
    params: StudentCertificatesParams = {},
  ): Observable<CertificateResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.students.certificates(studentId)}`;
    return this.http
      .get<ApiResponse<CertificateResponse[]>>(url, { params: toHttpParams(params) })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  requestCertificate(request: IssueCertificateRequest): Observable<CertificateResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.certificates.create}`;
    return this.http
      .post<ApiResponse<CertificateResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Real backend shape verified live: this endpoint returns a JSON
  // envelope carrying a downloadToken, not a binary file
  // (Content-Type: application/json, confirmed against the running
  // backend) — see the CertificateDownloadResponse model comment. No
  // `responseType: 'blob'` here; that would just wrap the JSON as an
  // unusable blob.
  downloadCertificate(certificateId: string): Observable<CertificateDownloadResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.certificates.download(certificateId)}`;
    return this.http
      .get<ApiResponse<CertificateDownloadResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
