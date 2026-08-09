import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { InstructorSummaryApiService } from './instructor-summary-api.service';

describe('InstructorSummaryApiService', () => {
  let service: InstructorSummaryApiService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/summaries/batches/b1`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstructorSummaryApiService],
    });
    service = TestBed.inject(InstructorSummaryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getBatchSummary() calls GET /api/summaries/batches/{id}', () => {
    service.getBatchSummary('b1').subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'ok',
      data: { batchId: 'b1', totalRegistered: 10, totalCancelled: 2, generatedAt: 't' },
      error: null,
      meta: null,
      timestamp: 't',
    });
  });

  it('getAssessmentSummary() calls GET /api/summaries/batches/{id}/assessments', () => {
    service.getAssessmentSummary('b1').subscribe();
    const req = httpMock.expectOne(`${base}/assessments`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'ok',
      data: { batchId: 'b1', generatedAt: 't', assessments: [] },
      error: null,
      meta: null,
      timestamp: 't',
    });
  });

  it('getStatusSummary() calls GET /api/summaries/batches/{id}/status', () => {
    service.getStatusSummary('b1').subscribe();
    const req = httpMock.expectOne(`${base}/status`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'ok',
      data: { batchId: 'b1', totalRegistered: 10, totalCancelled: 2, generatedAt: 't' },
      error: null,
      meta: null,
      timestamp: 't',
    });
  });

  it('re-throws the ApiError with SUMMARY_ACCESS_DENIED on a 403 response', () => {
    let capturedError: { code: string } | undefined;
    service.getBatchSummary('b1').subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(base);
    req.flush(
      {
        success: false,
        message: 'You are not authorized to view summaries for this batch.',
        data: null,
        error: {
          code: 'SUMMARY_ACCESS_DENIED',
          message: 'You are not authorized to view summaries for this batch.',
          details: null,
          correlationId: null,
        },
        meta: null,
        timestamp: 't',
      },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(capturedError?.code).toBe('SUMMARY_ACCESS_DENIED');
  });
});
