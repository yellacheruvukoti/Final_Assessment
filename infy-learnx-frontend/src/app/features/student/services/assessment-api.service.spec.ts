import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { AssessmentResponse, AssessmentStatus, ScopeType } from '../../../core/models/assessment.model';
import { PagedResult } from '../../../core/models/api-response.model';
import { AssessmentApiService } from './assessment-api.service';

describe('AssessmentApiService', () => {
  let service: AssessmentApiService;
  let httpMock: HttpTestingController;

  const url = `${environment.apiBaseUrl}/assessments/upcoming`;

  const sample: AssessmentResponse = {
    assessmentId: 'a1',
    assessmentCode: 'ASM-0001',
    title: 'Java Fundamentals Assessment',
    description: null,
    status: AssessmentStatus.PUBLISHED,
    startTime: '2026-08-16T05:58:23Z',
    endTime: '2026-08-16T07:58:23Z',
    durationMinutes: 90,
    scopeType: ScopeType.BATCH,
    scopeId: 'b1',
    createdAt: '2026-08-09T00:00:00Z',
    updatedAt: '2026-08-09T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssessmentApiService],
    });
    service = TestBed.inject(AssessmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls GET /api/assessments/upcoming with pagination params', () => {
    let result: PagedResult<AssessmentResponse> | undefined;
    service.getUpcomingAssessments({ page: 0, size: 10, sort: 'startTime,asc' }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      (r) => r.url === url && r.params.get('page') === '0' && r.params.get('sort') === 'startTime,asc',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'ok',
      data: [sample],
      error: null,
      meta: null,
      timestamp: 't',
    });

    expect(result?.data).toEqual([sample]);
  });

  it('derives PagedResult.meta from the array when the backend returns meta:null', () => {
    let result: PagedResult<AssessmentResponse> | undefined;
    service.getUpcomingAssessments().subscribe((r) => (result = r));

    const req = httpMock.expectOne(url);
    req.flush({ success: true, message: 'ok', data: [sample], error: null, meta: null, timestamp: 't' });

    expect(result?.meta).toEqual({ page: 0, size: 1, totalElements: 1, totalPages: 1 });
  });

  it('throws the ApiError when success is false', () => {
    let capturedError: { code: string } | undefined;
    service.getUpcomingAssessments().subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(url);
    req.flush(
      {
        success: false,
        message: 'Service unavailable.',
        data: null,
        error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'Service unavailable.', details: null, correlationId: null },
        meta: null,
        timestamp: 't',
      },
      { status: 503, statusText: 'Service Unavailable' },
    );

    expect(capturedError?.code).toBe('DEPENDENCY_UNAVAILABLE');
  });
});
