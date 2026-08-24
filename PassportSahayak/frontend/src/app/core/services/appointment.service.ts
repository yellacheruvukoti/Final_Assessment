import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppointmentResponse, BookAppointmentRequest, CapacityResponse, CenterResponse,
  RescheduleRequest, SlotSearchResponse
} from '../models/appointment.model';
import { ServiceScheme } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly base = `${environment.apiUrl}/appointments`;
  private readonly centersBase = `${environment.apiUrl}/centers`;

  constructor(private http: HttpClient) {}

  listCenters(): Observable<CenterResponse[]> {
    return this.http.get<CenterResponse[]>(this.centersBase);
  }

  searchSlots(date: string, category: ServiceScheme, centerId?: number): Observable<SlotSearchResponse[]> {
    let params = new HttpParams().set('date', date).set('category', category);
    if (centerId) {
      params = params.set('centerId', centerId);
    }
    return this.http.get<SlotSearchResponse[]>(`${this.base}/slots`, { params });
  }

  capacity(centerId: number, date: string): Observable<CapacityResponse> {
    const params = new HttpParams().set('centerId', centerId).set('date', date);
    return this.http.get<CapacityResponse>(`${this.base}/capacity`, { params });
  }

  bookFresh(req: BookAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.base}/fresh/book`, req);
  }

  bookRenewal(req: BookAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.base}/renewal/book`, req);
  }

  reschedule(id: number, req: RescheduleRequest): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(`${this.base}/${id}/reschedule`, req);
  }

  cancel(id: number): Observable<AppointmentResponse> {
    return this.http.delete<AppointmentResponse>(`${this.base}/${id}`);
  }

  getById(id: number): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(`${this.base}/${id}`);
  }

  mine(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.base}/mine`);
  }

  complete(id: number): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.base}/${id}/complete`, {});
  }

  noShow(id: number): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.base}/${id}/no-show`, {});
  }
}
