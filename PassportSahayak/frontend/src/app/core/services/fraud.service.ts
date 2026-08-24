import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateEscalationRequest, EscalationCaseResponse, EscalationStatus, FileFraudReportRequest,
  FraudReportResponse, FraudReportStatus, ReferralMatrixEntry, UpdateFraudReportStatusRequest
} from '../models/fraud.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class FraudService {
  private readonly base = `${environment.apiUrl}/fraud`;

  constructor(private http: HttpClient) {}

  file(req: FileFraudReportRequest): Observable<FraudReportResponse> {
    return this.http.post<FraudReportResponse>(`${this.base}/reports`, req);
  }

  mine(): Observable<FraudReportResponse[]> {
    return this.http.get<FraudReportResponse[]>(`${this.base}/reports/mine`);
  }

  listByStatus(status: FraudReportStatus, page = 0, size = 10): Observable<Page<FraudReportResponse>> {
    const params = new HttpParams().set('status', status).set('page', page).set('size', size);
    return this.http.get<Page<FraudReportResponse>>(`${this.base}/reports`, { params });
  }

  updateStatus(id: number, req: UpdateFraudReportStatusRequest): Observable<FraudReportResponse> {
    return this.http.patch<FraudReportResponse>(`${this.base}/reports/${id}/status`, req);
  }

  referralMatrix(): Observable<ReferralMatrixEntry[]> {
    return this.http.get<ReferralMatrixEntry[]>(`${this.base}/referral-matrix`);
  }

  createEscalation(req: CreateEscalationRequest): Observable<EscalationCaseResponse> {
    return this.http.post<EscalationCaseResponse>(`${this.base}/escalations`, req);
  }

  escalationsForArn(arn: string): Observable<EscalationCaseResponse[]> {
    return this.http.get<EscalationCaseResponse[]>(`${this.base}/escalations/${arn}`);
  }

  listEscalationsByStatus(status: EscalationStatus, page = 0, size = 10): Observable<Page<EscalationCaseResponse>> {
    const params = new HttpParams().set('status', status).set('page', page).set('size', size);
    return this.http.get<Page<EscalationCaseResponse>>(`${this.base}/escalations`, { params });
  }

  updateEscalationStatus(id: number, status: EscalationStatus): Observable<EscalationCaseResponse> {
    return this.http.patch<EscalationCaseResponse>(`${this.base}/escalations/${id}/status`, { status });
  }
}
