import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassificationRule, DispatchPvCaseRequest, PvCaseResponse, PvCaseStatus, UpdatePvCaseStatusRequest } from '../models/pv.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class PvService {
  private readonly base = `${environment.apiUrl}/pv`;

  constructor(private http: HttpClient) {}

  classificationRules(): Observable<ClassificationRule[]> {
    return this.http.get<ClassificationRule[]>(`${this.base}/classification-rules`);
  }

  dispatch(req: DispatchPvCaseRequest): Observable<PvCaseResponse> {
    return this.http.post<PvCaseResponse>(`${this.base}/cases`, req);
  }

  getByArn(arn: string): Observable<PvCaseResponse> {
    return this.http.get<PvCaseResponse>(`${this.base}/cases/${arn}`);
  }

  listByStatus(status: PvCaseStatus, page = 0, size = 10): Observable<Page<PvCaseResponse>> {
    const params = new HttpParams().set('status', status).set('page', page).set('size', size);
    return this.http.get<Page<PvCaseResponse>>(`${this.base}/cases`, { params });
  }

  updateStatus(arn: string, req: UpdatePvCaseStatusRequest): Observable<PvCaseResponse> {
    return this.http.patch<PvCaseResponse>(`${this.base}/cases/${arn}/status`, req);
  }

  refreshSlaBreaches(): Observable<PvCaseResponse[]> {
    return this.http.post<PvCaseResponse[]>(`${this.base}/sla-breaches/refresh`, {});
  }
}
