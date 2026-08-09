import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { CourseResponse, CourseStatus } from '../../../core/models/course.model';
import { InstructorCourseApiService } from './instructor-course-api.service';

describe('InstructorCourseApiService', () => {
  let service: InstructorCourseApiService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/courses`;

  const sample: CourseResponse = {
    courseId: 'c1',
    courseCode: 'CRS-0001',
    title: 'Java Foundations',
    description: null,
    status: CourseStatus.DRAFT,
    instructorId: 'i1',
    publishedAt: null,
    createdAt: 't',
    updatedAt: 't',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstructorCourseApiService],
    });
    service = TestBed.inject(InstructorCourseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getCourses() calls GET /api/courses', () => {
    service.getCourses({ status: CourseStatus.DRAFT }).subscribe();
    const req = httpMock.expectOne((r) => r.url === base && r.params.get('status') === 'DRAFT');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [sample], error: null, meta: null, timestamp: 't' });
  });

  it('getCourseById() calls GET /api/courses/{id}', () => {
    service.getCourseById('c1').subscribe();
    const req = httpMock.expectOne(`${base}/c1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('createCourse() POSTs to /api/courses with courseCode/title/description/instructorId', () => {
    service.createCourse({ courseCode: 'CRS-0002', title: 'New Course', description: null, instructorId: 'i1' }).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      courseCode: 'CRS-0002',
      title: 'New Course',
      description: null,
      instructorId: 'i1',
    });
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('updateCourse() PUTs to /api/courses/{id} with title/description/status', () => {
    service.updateCourse('c1', { title: 'Updated', description: null, status: CourseStatus.PUBLISHED }).subscribe();
    const req = httpMock.expectOne(`${base}/c1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Updated', description: null, status: CourseStatus.PUBLISHED });
    req.flush({ success: true, message: 'ok', data: sample, error: null, meta: null, timestamp: 't' });
  });

  it('createModule() POSTs to /api/courses/{id}/modules', () => {
    service.createModule('c1', { title: 'Module 1', moduleOrder: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}/c1/modules`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Module 1', moduleOrder: 1 });
    req.flush({
      success: true,
      message: 'ok',
      data: { moduleId: 'm1', courseId: 'c1', title: 'Module 1', moduleOrder: 1, status: 'ACTIVE', createdAt: 't', updatedAt: 't' },
      error: null,
      meta: null,
      timestamp: 't',
    });
  });

  it('createMaterial() POSTs to /api/courses/{id}/materials', () => {
    service
      .createMaterial('c1', {
        title: 'Notes',
        materialType: 'PDF' as never,
        resourcePath: '/x.pdf',
        accessLevel: 'ENROLLED_ONLY' as never,
        moduleId: 'm1',
      })
      .subscribe();
    const req = httpMock.expectOne(`${base}/c1/materials`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'ok', data: {}, error: null, meta: null, timestamp: 't' });
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
