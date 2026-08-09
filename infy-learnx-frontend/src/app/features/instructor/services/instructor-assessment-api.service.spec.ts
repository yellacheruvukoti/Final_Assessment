import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { AssessmentStatus, ScopeType } from '../../../core/models/assessment.model';
import { InstructorAssessmentApiService } from './instructor-assessment-api.service';

describe('InstructorAssessmentApiService', () => {
  let service: InstructorAssessmentApiService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/assessments`;

  const sample = {
    assessmentId: 'a1',
    assessmentCode: 'ASM-0001',
    title: 'Java Test',
    description: null,
    status: AssessmentStatus.DRAFT,
    startTime: 't',
    endTime: 't',
    durationMinutes: 60,
    scopeType: ScopeType.COURSE,
    scopeId: 'c1',
    createdAt: 't',
    updatedAt: 't',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstructorAssessmentApiService],
    });
    service = TestBed.inject(InstructorAssessmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAssessments() calls GET /api/assessments with the status filter only', () => {
    service.getAssessments({ status: AssessmentStatus.PUBLISHED }).subscribe();
    const req = httpMock.expectOne((r) => r.url === base && r.params.get('status') === 'PUBLISHED');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [sample], error: null, meta: null, timestamp: 't' });
  });

  it('getAssessmentById() calls GET /api/assessments/{id}', () => {
    service.getAssessmentById('a1').subscribe();
    const req = httpMock.expectOne(`${base}/a1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('createAssessment() POSTs to /api/assessments with assessmentCode included', () => {
    service
      .createAssessment({
        assessmentCode: 'ASM-0002',
        title: 'New Assessment',
        description: null,
        status: AssessmentStatus.DRAFT,
        startTime: 't1',
        endTime: 't2',
        durationMinutes: 60,
        scopeType: ScopeType.COURSE,
        scopeId: 'c1',
      })
      .subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.assessmentCode).toBe('ASM-0002');
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('updateAssessment() PUTs to /api/assessments/{id} without scopeType/scopeId', () => {
    service
      .updateAssessment('a1', {
        title: 'Updated',
        description: null,
        status: AssessmentStatus.PUBLISHED,
        startTime: 't1',
        endTime: 't2',
        durationMinutes: 60,
      })
      .subscribe();
    const req = httpMock.expectOne(`${base}/a1`);
    expect(req.request.method).toBe('PUT');
    expect((req.request.body as Record<string, unknown>)['scopeType']).toBeUndefined();
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('throws the ApiError when success is false', () => {
    let capturedError: { code: string } | undefined;
    service.getAssessmentById('missing').subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });
    const req = httpMock.expectOne(`${base}/missing`);
    req.flush(
      {
        success: false,
        message: 'Assessment not found.',
        data: null,
        error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found.', details: null, correlationId: null },
        meta: null,
        timestamp: 't',
      },
      { status: 404, statusText: 'Not Found' },
    );
    expect(capturedError?.code).toBe('ASSESSMENT_NOT_FOUND');
  });
});
