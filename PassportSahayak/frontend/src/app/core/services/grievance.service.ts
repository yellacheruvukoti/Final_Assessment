import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppealAuthorityInfo, AppealDecisionRequest, AppealResponse, AppealStatus, FileAppealRequest,
  FileGrievanceRequest, GrievanceResponse, GrievanceStatus, SlaMatrixEntry, UpdateGrievanceStatusRequest
} from '../models/grievance.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class GrievanceService {
  private readonly base = `${environment.apiUrl}/grievances`;
  private readonly appealsBase = `${environment.apiUrl}/appeals`;

  constructor(private http: HttpClient) {}

  file(req: FileGrievanceRequest): Observable<GrievanceResponse> {
    return this.http.post<GrievanceResponse>(this.base, req);
  }

  mine(): Observable<GrievanceResponse[]> {
    return this.http.get<GrievanceResponse[]>(`${this.base}/mine`);
  }

  listByStatus(status: GrievanceStatus, page = 0, size = 10): Observable<Page<GrievanceResponse>> {
    const params = new HttpParams().set('status', status).set('page', page).set('size', size);
    return this.http.get<Page<GrievanceResponse>>(this.base, { params });
  }

  updateStatus(id: number, req: UpdateGrievanceStatusRequest): Observable<GrievanceResponse> {
    return this.http.patch<GrievanceResponse>(`${this.base}/${id}/status`, req);
  }

  slaMatrix(): Observable<SlaMatrixEntry[]> {
    return this.http.get<SlaMatrixEntry[]>(`${this.base}/sla-matrix`);
  }

  fileAppeal(req: FileAppealRequest): Observable<AppealResponse> {
    return this.http.post<AppealResponse>(this.appealsBase, req);
  }

  appealsForArn(arn: string): Observable<AppealResponse[]> {
    return this.http.get<AppealResponse[]>(`${this.appealsBase}/${arn}`);
  }

  listAppealsByStatus(status: AppealStatus, page = 0, size = 10): Observable<Page<AppealResponse>> {
    const params = new HttpParams().set('status', status).set('page', page).set('size', size);
    return this.http.get<Page<AppealResponse>>(this.appealsBase, { params });
  }

  decideAppeal(id: number, req: AppealDecisionRequest): Observable<AppealResponse> {
    return this.http.patch<AppealResponse>(`${this.appealsBase}/${id}/decision`, req);
  }

  authorityChain(): Observable<AppealAuthorityInfo[]> {
    return this.http.get<AppealAuthorityInfo[]>(`${this.appealsBase}/authority-chain`);
  }
}
