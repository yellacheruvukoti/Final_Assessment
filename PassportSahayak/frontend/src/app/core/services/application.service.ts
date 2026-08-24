import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplicationResponse, ApplicationStatus, ApplicationStatusResponse, ApplicationType,
  BookletType, CreateApplicationRequest, DocumentChecklistResponse, EligibilityCheckRequest,
  EligibilityCheckResponse, FeeEstimateResponse, ServiceScheme, UpdateApplicationStatusRequest
} from '../models/application.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly base = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  checkEligibility(req: EligibilityCheckRequest): Observable<EligibilityCheckResponse> {
    return this.http.post<EligibilityCheckResponse>(`${this.base}/eligibility/check`, req);
  }

  getDocumentChecklist(applicationType: ApplicationType, minor: boolean): Observable<DocumentChecklistResponse> {
    const params = new HttpParams().set('applicationType', applicationType).set('minor', minor);
    return this.http.get<DocumentChecklistResponse>(`${this.base}/document-checklist`, { params });
  }

  getFeeEstimate(applicationType: ApplicationType, serviceScheme: ServiceScheme, bookletType: BookletType, minor: boolean): Observable<FeeEstimateResponse> {
    const params = new HttpParams()
      .set('applicationType', applicationType)
      .set('serviceScheme', serviceScheme)
      .set('bookletType', bookletType)
      .set('minor', minor);
    return this.http.get<FeeEstimateResponse>(`${this.base}/fee-estimate`, { params });
  }

  create(req: CreateApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.base, req);
  }

  mine(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.base}/mine`);
  }

  getByArn(arn: string): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(`${this.base}/${arn}`);
  }

  getStatus(arn: string): Observable<ApplicationStatusResponse> {
    return this.http.get<ApplicationStatusResponse>(`${this.base}/${arn}/status`);
  }

  listByStatus(status: ApplicationStatus, page = 0, size = 10): Observable<Page<ApplicationResponse>> {
    const params = new HttpParams().set('status', status).set('page', page).set('size', size);
    return this.http.get<Page<ApplicationResponse>>(this.base, { params });
  }

  updateStatus(arn: string, req: UpdateApplicationStatusRequest): Observable<ApplicationResponse> {
    return this.http.patch<ApplicationResponse>(`${this.base}/${arn}/status`, req);
  }
}
