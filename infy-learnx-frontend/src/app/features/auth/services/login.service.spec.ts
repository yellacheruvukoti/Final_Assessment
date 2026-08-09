import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserRole } from '../../../core/constants/role.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { LoginResponse, LoginService } from './login.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoginService, { provide: AuthService, useValue: authServiceSpy }],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('POSTs to the correct endpoint with the request body', () => {
    service.login({ email: 'alice@infy.com', password: 'secret' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'alice@infy.com', password: 'secret' });

    req.flush({
      success: true,
      message: 'Login successful.',
      data: { userId: 'u1', role: UserRole.STUDENT },
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    } as ApiResponse<LoginResponse>);

    httpMock.expectOne(`${environment.apiBaseUrl}/students/by-user/u1`).flush({
      success: true,
      message: 'Student retrieved successfully.',
      data: { studentId: 's1' },
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    });
  });

  it('updates AuthService session with the resolved studentId on success (STUDENT role)', () => {
    service.login({ email: 'alice@infy.com', password: 'secret' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush({
      success: true,
      message: 'Login successful.',
      data: { userId: 'u1', role: UserRole.STUDENT },
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    } as ApiResponse<LoginResponse>);

    httpMock.expectOne(`${environment.apiBaseUrl}/students/by-user/u1`).flush({
      success: true,
      message: 'Student retrieved successfully.',
      data: { studentId: 's1' },
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    });

    expect(authServiceSpy.login).toHaveBeenCalledWith('u1', UserRole.STUDENT, 's1');
  });

  it('updates AuthService session with the resolved instructorId on success (INSTRUCTOR role)', () => {
    service.login({ email: 'bob@infy.com', password: 'secret' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush({
      success: true,
      message: 'Login successful.',
      data: { userId: 'u2', role: UserRole.INSTRUCTOR },
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    } as ApiResponse<LoginResponse>);

    httpMock.expectOne(`${environment.apiBaseUrl}/instructors/by-user/u2`).flush({
      success: true,
      message: 'Instructor retrieved successfully.',
      data: { instructorId: 'i1' },
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    });

    expect(authServiceSpy.login).toHaveBeenCalledWith('u2', UserRole.INSTRUCTOR, 'i1');
  });

  it('updates AuthService session with a null profileId on success (ADMINISTRATOR role, no resolution call)', () => {
    service.login({ email: 'carol@infy.com', password: 'secret' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush({
      success: true,
      message: 'Login successful.',
      data: { userId: 'u3', role: UserRole.ADMINISTRATOR },
      error: null,
      meta: null,
      timestamp: '2026-08-09T00:00:00Z',
    } as ApiResponse<LoginResponse>);

    expect(authServiceSpy.login).toHaveBeenCalledWith('u3', UserRole.ADMINISTRATOR, null);
  });

  it('re-throws the ApiError from the envelope on a 401 response', () => {
    let capturedError: { code: string; message: string } | undefined;

    service.login({ email: 'nobody@nowhere.com', password: 'x' }).subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush(
      {
        success: false,
        message: 'Invalid email or password.',
        data: null,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
          details: null,
          correlationId: 'abc-123',
        },
        meta: null,
        timestamp: '2026-08-09T00:00:00Z',
      },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(capturedError?.code).toBe('INVALID_CREDENTIALS');
    expect(capturedError?.message).toBe('Invalid email or password.');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('re-throws the ApiError from the envelope on a 400 validation response', () => {
    let capturedError: { code: string } | undefined;

    service.login({ email: 'alice@infy.com', password: '' }).subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush(
      {
        success: false,
        message: 'Request validation failed.',
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed.',
          details: ['password: must not be blank'],
          correlationId: 'abc-456',
        },
        meta: null,
        timestamp: '2026-08-09T00:00:00Z',
      },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(capturedError?.code).toBe('VALIDATION_ERROR');
  });
});
