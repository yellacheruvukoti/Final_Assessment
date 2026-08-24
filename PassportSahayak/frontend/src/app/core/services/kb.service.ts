import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IngestDocumentResponse, KbChunkResponse, KbDocumentResponse } from '../models/kb.model';
import { Page } from '../models/page.model';

export interface IngestFormValue {
  title: string;
  docCode?: string;
  version: string;
  audience?: string;
  effectiveDate?: string;
  tags?: string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class KbService {
  private readonly base = `${environment.apiUrl}/kb`;

  constructor(private http: HttpClient) {}

  ingest(value: IngestFormValue): Observable<IngestDocumentResponse> {
    const form = new FormData();
    form.append('title', value.title);
    if (value.docCode) form.append('docCode', value.docCode);
    form.append('version', value.version || 'v1.0');
    if (value.audience) form.append('audience', value.audience);
    if (value.effectiveDate) form.append('effectiveDate', value.effectiveDate);
    if (value.tags) form.append('tags', value.tags);
    form.append('content', value.content);
    return this.http.post<IngestDocumentResponse>(`${this.base}/ingest`, form);
  }

  list(page = 0, size = 20): Observable<Page<KbDocumentResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<KbDocumentResponse>>(`${this.base}/documents`, { params });
  }

  getById(documentId: string): Observable<KbDocumentResponse> {
    return this.http.get<KbDocumentResponse>(`${this.base}/documents/${documentId}`);
  }

  getChunks(documentId: string): Observable<KbChunkResponse[]> {
    return this.http.get<KbChunkResponse[]>(`${this.base}/documents/${documentId}/chunks`);
  }

  supersede(documentId: string): Observable<KbDocumentResponse> {
    return this.http.patch<KbDocumentResponse>(`${this.base}/documents/${documentId}/supersede`, {});
  }

  backfillEmbeddings(): Observable<{ chunksEmbedded: number }> {
    return this.http.post<{ chunksEmbedded: number }>(`${this.base}/embeddings/backfill`, {});
  }
}
