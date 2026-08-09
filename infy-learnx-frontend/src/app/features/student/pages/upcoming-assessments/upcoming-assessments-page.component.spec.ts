import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';

import { AssessmentStatus, ScopeType } from '../../../../core/models/assessment.model';
import { PagedResult } from '../../../../core/models/api-response.model';
import { AssessmentResponse } from '../../../../core/models/assessment.model';
import { RegistrationResponse, RegistrationStatus } from '../../../../core/models/registration.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { RegistrationApiService } from '../../services/registration-api.service';
import { UpcomingAssessmentsPageComponent } from './upcoming-assessments-page.component';

describe('UpcomingAssessmentsPageComponent', () => {
  let component: UpcomingAssessmentsPageComponent;
  let fixture: ComponentFixture<UpcomingAssessmentsPageComponent>;
  let assessmentApiSpy: jasmine.SpyObj<AssessmentApiService>;
  let registrationApiSpy: jasmine.SpyObj<RegistrationApiService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const assessment: AssessmentResponse = {
    assessmentId: 'a1',
    assessmentCode: 'ASM-0001',
    title: 'Java Fundamentals',
    description: null,
    status: AssessmentStatus.PUBLISHED,
    startTime: '2026-09-01T10:00:00',
    endTime: '2026-09-01T12:00:00',
    durationMinutes: 120,
    scopeType: ScopeType.BATCH,
    scopeId: 'b1',
    createdAt: '2026-08-01T00:00:00',
    updatedAt: '2026-08-01T00:00:00',
  };

  const pagedUpcoming: PagedResult<AssessmentResponse> = {
    data: [assessment],
    meta: { page: 0, size: 1, totalElements: 1, totalPages: 1 },
  };

  function buildRegistration(status: RegistrationStatus): RegistrationResponse {
    return {
      registrationId: 'r1',
      studentId: 's1',
      assessmentId: 'a1',
      status,
      registeredAt: '2026-08-01T00:00:00',
      cancelledAt: null,
      lastReactivatedAt: null,
      sourceChannel: 'WEB',
      createdAt: '2026-08-01T00:00:00',
      updatedAt: '2026-08-01T00:00:00',
    };
  }

  beforeEach(() => {
    assessmentApiSpy = jasmine.createSpyObj('AssessmentApiService', ['getUpcomingAssessments']);
    registrationApiSpy = jasmine.createSpyObj('RegistrationApiService', [
      'getStudentRegistrations',
      'registerForAssessment',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentProfileId: 's1' });

    assessmentApiSpy.getUpcomingAssessments.and.returnValue(of(pagedUpcoming));
    registrationApiSpy.getStudentRegistrations.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [UpcomingAssessmentsPageComponent],
      providers: [
        Title,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AssessmentApiService, useValue: assessmentApiSpy },
        { provide: RegistrationApiService, useValue: registrationApiSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(UpcomingAssessmentsPageComponent);
    component = fixture.componentInstance;
  });

  it('calls getUpcomingAssessments on init', () => {
    component.ngOnInit();
    expect(assessmentApiSpy.getUpcomingAssessments).toHaveBeenCalled();
    expect(registrationApiSpy.getStudentRegistrations).toHaveBeenCalledWith('s1');
    expect(component.visibleRows.length).toBe(1);
    expect(component.visibleRows[0].isRegistered).toBe(false);
  });

  it('marks a row already REGISTERED as isRegistered on load', () => {
    registrationApiSpy.getStudentRegistrations.and.returnValue(
      of([buildRegistration(RegistrationStatus.REGISTERED)]),
    );

    component.ngOnInit();

    expect(component.visibleRows[0].isRegistered).toBe(true);
  });

  it('sets isRegistering=true while a registration request is pending', () => {
    component.ngOnInit();
    const row = component.visibleRows[0];
    const pending = new Subject<RegistrationResponse>();
    registrationApiSpy.registerForAssessment.and.returnValue(pending.asObservable());

    component.onRegister(row);

    expect(row.isRegistering).toBe(true);
    expect(registrationApiSpy.registerForAssessment).toHaveBeenCalledWith({
      studentId: 's1',
      assessmentId: 'a1',
    });
  });

  it('sets isRegistered=true and isRegistering=false on successful registration', () => {
    component.ngOnInit();
    const row = component.visibleRows[0];
    registrationApiSpy.registerForAssessment.and.returnValue(of(buildRegistration(RegistrationStatus.REGISTERED)));

    component.onRegister(row);

    expect(row.isRegistered).toBe(true);
    expect(row.isRegistering).toBe(false);
    expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith('Registered successfully.');
  });

  it('on a 409-style failure, calls showError and resets isRegistering', () => {
    component.ngOnInit();
    const row = component.visibleRows[0];
    registrationApiSpy.registerForAssessment.and.returnValue(
      throwError(() => ({ code: 'DUPLICATE_REGISTRATION', message: 'Already registered.' })),
    );

    component.onRegister(row);

    expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Already registered.');
    expect(row.isRegistering).toBe(false);
    expect(row.isRegistered).toBe(false);
  });
});
