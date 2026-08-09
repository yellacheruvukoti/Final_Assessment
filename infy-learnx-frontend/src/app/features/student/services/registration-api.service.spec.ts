import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { RegistrationResponse, RegistrationStatus } from '../../../core/models/registration.model';
import { RegistrationApiService } from './registration-api.service';

describe('RegistrationApiService', () => {
  let service: RegistrationApiService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/registrations`;

  const sample: RegistrationResponse = {
    registrationId: 'r1',
    studentId: 's1',
    assessmentId: 'a1',
    status: RegistrationStatus.REGISTERED,
    registeredAt: '2026-08-09T00:00:00Z',
    cancelledAt: null,
    lastReactivatedAt: null,
    sourceChannel: null,
    createdAt: '2026-08-09T00:00:00Z',
    updatedAt: '2026-08-09T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistrationApiService],
    });
    service = TestBed.inject(RegistrationApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getStudentRegistrations() calls GET /api/students/{id}/registrations', () => {
    service.getStudentRegistrations('s1', { page: 0, size: 10 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiBaseUrl}/students/s1/registrations`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [sample], error: null, meta: null, timestamp: 't' });
  });

  it('registerForAssessment() POSTs to /api/registrations with the request body', () => {
    service.registerForAssessment({ studentId: 's1', assessmentId: 'a1' }).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ studentId: 's1', assessmentId: 'a1' });
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('registerForAssessment() re-throws on 409 duplicate registration', () => {
    let capturedError: { code: string } | undefined;
    service.registerForAssessment({ studentId: 's1', assessmentId: 'a1' }).subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(base);
    req.flush(
      {
        success: false,
        message: 'You are already registered for this assessment.',
        data: null,
        error: {
          code: 'DUPLICATE_REGISTRATION',
          message: 'You are already registered for this assessment.',
          details: null,
          correlationId: null,
        },
        meta: null,
        timestamp: 't',
      },
      { status: 409, statusText: 'Conflict' },
    );

    expect(capturedError?.code).toBe('DUPLICATE_REGISTRATION');
  });

  it('registerForAssessment() re-throws on 422 assessment not upcoming', () => {
    let capturedError: { code: string } | undefined;
    service.registerForAssessment({ studentId: 's1', assessmentId: 'a1' }).subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(base);
    req.flush(
      {
        success: false,
        message: 'Registration is not allowed for this assessment.',
        data: null,
        error: {
          code: 'ASSESSMENT_NOT_UPCOMING',
          message: 'Registration is not allowed for this assessment.',
          details: null,
          correlationId: null,
        },
        meta: null,
        timestamp: 't',
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    expect(capturedError?.code).toBe('ASSESSMENT_NOT_UPCOMING');
  });

  it('cancelRegistration() PATCHes /api/registrations/{id}/cancel with no body', () => {
    service.cancelRegistration('r1').subscribe();
    const req = httpMock.expectOne(`${base}/r1/cancel`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('reRegisterForAssessment() PATCHes /api/registrations/{id}/reregister with no body', () => {
    service.reRegisterForAssessment('r1').subscribe();
    const req = httpMock.expectOne(`${base}/r1/reregister`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });
});
