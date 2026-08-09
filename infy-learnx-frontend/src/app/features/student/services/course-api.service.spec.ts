import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CourseResponse, CourseStatus } from '../../../core/models/course.model';
import { CourseApiService } from './course-api.service';

describe('CourseApiService', () => {
  let service: CourseApiService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/courses`;

  const sampleCourse: CourseResponse = {
    courseId: 'c1',
    courseCode: 'CRS-0001',
    title: 'Java Foundations',
    description: null,
    status: CourseStatus.PUBLISHED,
    instructorId: 'i1',
    publishedAt: null,
    createdAt: '2026-08-09T00:00:00Z',
    updatedAt: '2026-08-09T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseApiService],
    });
    service = TestBed.inject(CourseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getCourses() calls GET /api/courses with query params and unwraps the envelope', () => {
    let result: CourseResponse[] | undefined;
    service.getCourses({ status: CourseStatus.PUBLISHED, page: 0, size: 10 }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      (r) => r.url === base && r.params.get('status') === 'PUBLISHED' && r.params.get('page') === '0',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'ok',
      data: [sampleCourse],
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    } as ApiResponse<CourseResponse[]>);

    expect(result).toEqual([sampleCourse]);
  });

  it('getCourseById() calls GET /api/courses/{id}', () => {
    service.getCourseById('c1').subscribe();
    const req = httpMock.expectOne(`${base}/c1`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'ok',
      data: sampleCourse,
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    } as ApiResponse<CourseResponse>);
  });

  it('getCourseMaterials() calls GET /api/courses/{id}/materials', () => {
    service.getCourseMaterials('c1').subscribe();
    const req = httpMock.expectOne(`${base}/c1/materials`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [], error: null, meta: null, timestamp: 't' });
  });

  it('getCourseQuizzes() calls GET /api/courses/{id}/quizzes', () => {
    service.getCourseQuizzes('c1').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/c1/quizzes`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [], error: null, meta: null, timestamp: 't' });
  });

  it('getCourseProgress() calls GET /api/courses/{courseId}/progress/{studentId} and returns an array', () => {
    let result: unknown;
    service.getCourseProgress('c1', 's1').subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${base}/c1/progress/s1`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'ok',
      data: [
        {
          progressId: 'p1',
          studentId: 's1',
          courseId: 'c1',
          moduleId: null,
          completionPercentage: 50,
          progressStatus: 'IN_PROGRESS',
          lastAccessedAt: null,
          updatedAt: 't',
        },
      ],
      error: null,
      meta: null,
      timestamp: 't',
    });

    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBe(1);
  });

  it('throws the ApiError when success is false', () => {
    let capturedError: { code: string } | undefined;
    service.getCourseById('missing').subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(`${base}/missing`);
    req.flush(
      {
        success: false,
        message: 'Course not found.',
        data: null,
        error: { code: 'COURSE_NOT_FOUND', message: 'Course not found.', details: null, correlationId: null },
        meta: null,
        timestamp: 't',
      },
      { status: 404, statusText: 'Not Found' },
    );

    expect(capturedError?.code).toBe('COURSE_NOT_FOUND');
  });
});
