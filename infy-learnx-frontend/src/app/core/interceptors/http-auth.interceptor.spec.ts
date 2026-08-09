import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ApiRoutes } from '../constants/api-routes.constants';
import { UserRole } from '../constants/role.constants';
import { AuthService } from '../services/auth.service';
import { HttpAuthInterceptor } from './http-auth.interceptor';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('HttpAuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function setup(role: UserRole | null, userId: string | null): void {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentRole: role,
      currentUserId: userId,
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpMock.verify());

  it('attaches X-Role for an authenticated API request', () => {
    setup(UserRole.STUDENT, 'u1');
    http.get(`${environment.apiBaseUrl}/courses`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses`);
    expect(req.request.headers.get('X-Role')).toBe(UserRole.STUDENT);
    req.flush({});
  });

  it('attaches X-User-Id for an authenticated API request', () => {
    setup(UserRole.STUDENT, 'u1');
    http.get(`${environment.apiBaseUrl}/courses`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses`);
    expect(req.request.headers.get('X-User-Id')).toBe('u1');
    req.flush({});
  });

  it('attaches a UUID X-Correlation-Id to every API request', () => {
    setup(null, null);
    http.get(`${environment.apiBaseUrl}/courses`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses`);
    expect(req.request.headers.get('X-Correlation-Id')).toMatch(UUID_PATTERN);
    req.flush({});
  });

  it('does not attach X-Role/X-User-Id when unauthenticated', () => {
    setup(null, null);
    http.get(`${environment.apiBaseUrl}/courses`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses`);
    expect(req.request.headers.has('X-Role')).toBe(false);
    expect(req.request.headers.has('X-User-Id')).toBe(false);
    req.flush({});
  });

  it('sets Content-Type: application/json on POST', () => {
    setup(null, null);
    http.post(`${environment.apiBaseUrl}/courses`, {}).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses`);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({});
  });

  it('sets Content-Type: application/json on PUT', () => {
    setup(null, null);
    http.put(`${environment.apiBaseUrl}/courses/c1`, {}).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses/c1`);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({});
  });

  it('sets Content-Type: application/json on PATCH', () => {
    setup(null, null);
    http.patch(`${environment.apiBaseUrl}/registrations/r1/cancel`, null).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/registrations/r1/cancel`);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({});
  });

  it('does not set Content-Type on GET', () => {
    setup(null, null);
    http.get(`${environment.apiBaseUrl}/courses`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses`);
    expect(req.request.headers.has('Content-Type')).toBe(false);
    req.flush({});
  });

  it('attaches a UUID Idempotency-Key on POST /api/registrations only', () => {
    setup(null, null);
    http.post(`${environment.apiBaseUrl}/${ApiRoutes.registrations.create}`, {}).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/registrations`);
    expect(req.request.headers.get('Idempotency-Key')).toMatch(UUID_PATTERN);
    req.flush({});
  });

  it('does not attach Idempotency-Key on other POST requests', () => {
    setup(null, null);
    http.post(`${environment.apiBaseUrl}/courses`, {}).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/courses`);
    expect(req.request.headers.has('Idempotency-Key')).toBe(false);
    req.flush({});
  });

  it('does not attach any custom headers to non-API URLs', () => {
    setup(UserRole.STUDENT, 'u1');
    http.get('/assets/some-asset.json').subscribe();
    const req = httpMock.expectOne('/assets/some-asset.json');
    expect(req.request.headers.has('X-Role')).toBe(false);
    expect(req.request.headers.has('X-Correlation-Id')).toBe(false);
    req.flush({});
  });
});
