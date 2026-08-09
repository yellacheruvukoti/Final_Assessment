import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { CertificateResponse, CertificateStatus } from '../../../core/models/certificate.model';
import { CertificateApiService } from './certificate-api.service';

describe('CertificateApiService', () => {
  let service: CertificateApiService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/certificates`;

  const sample: CertificateResponse = {
    certificateId: 'c1',
    studentId: 's1',
    assessmentId: 'a1',
    courseId: 'co1',
    score: 85,
    status: CertificateStatus.ISSUED,
    issuedAt: '2026-08-09T00:00:00Z',
    createdAt: '2026-08-09T00:00:00Z',
    updatedAt: '2026-08-09T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CertificateApiService],
    });
    service = TestBed.inject(CertificateApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getStudentCertificates() calls GET /api/students/{id}/certificates', () => {
    service.getStudentCertificates('s1').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiBaseUrl}/students/s1/certificates`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [sample], error: null, meta: null, timestamp: 't' });
  });

  it('requestCertificate() POSTs to /api/certificates with the request body', () => {
    service.requestCertificate({ studentId: 's1', assessmentId: 'a1', score: 85 }).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ studentId: 's1', assessmentId: 'a1', score: 85 });
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('requestCertificate() re-throws on 409 certificate already issued', () => {
    let capturedError: { code: string } | undefined;
    service.requestCertificate({ studentId: 's1', assessmentId: 'a1', score: 85 }).subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(base);
    req.flush(
      {
        success: false,
        message: 'A certificate has already been issued for this assessment.',
        data: null,
        error: {
          code: 'CERTIFICATE_ALREADY_ISSUED',
          message: 'A certificate has already been issued for this assessment.',
          details: null,
          correlationId: null,
        },
        meta: null,
        timestamp: 't',
      },
      { status: 409, statusText: 'Conflict' },
    );

    expect(capturedError?.code).toBe('CERTIFICATE_ALREADY_ISSUED');
  });

  it('downloadCertificate() calls GET /api/certificates/{id}/download and unwraps the JSON envelope', () => {
    let result: { downloadToken: string } | undefined;
    service.downloadCertificate('c1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${base}/c1/download`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'Certificate ready for download.',
      data: {
        certificateId: 'c1',
        studentId: 's1',
        assessmentId: 'a1',
        courseId: 'co1',
        score: 85,
        issuedAt: '2026-08-09T00:00:00Z',
        downloadToken: 'dlt-abc123',
      },
      error: null,
      meta: null,
      timestamp: 't',
    });

    expect(result?.downloadToken).toBe('dlt-abc123');
  });
});
