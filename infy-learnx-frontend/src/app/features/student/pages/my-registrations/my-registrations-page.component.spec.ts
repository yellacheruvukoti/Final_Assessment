import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { AssessmentStatus, ScopeType } from '../../../../core/models/assessment.model';
import { AssessmentResponse } from '../../../../core/models/assessment.model';
import { RegistrationResponse, RegistrationStatus } from '../../../../core/models/registration.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { RegistrationApiService } from '../../services/registration-api.service';
import { MyRegistrationsPageComponent } from './my-registrations-page.component';

describe('MyRegistrationsPageComponent', () => {
  let component: MyRegistrationsPageComponent;
  let fixture: ComponentFixture<MyRegistrationsPageComponent>;
  let registrationApiSpy: jasmine.SpyObj<RegistrationApiService>;
  let assessmentApiSpy: jasmine.SpyObj<AssessmentApiService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const futureAssessment: AssessmentResponse = {
    assessmentId: 'a1',
    assessmentCode: 'ASM-0001',
    title: 'Java Fundamentals',
    description: null,
    status: AssessmentStatus.PUBLISHED,
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    durationMinutes: 120,
    scopeType: ScopeType.BATCH,
    scopeId: 'b1',
    createdAt: '2026-08-01T00:00:00',
    updatedAt: '2026-08-01T00:00:00',
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
    registrationApiSpy = jasmine.createSpyObj('RegistrationApiService', [
      'getStudentRegistrations',
      'cancelRegistration',
      'reRegisterForAssessment',
    ]);
    assessmentApiSpy = jasmine.createSpyObj('AssessmentApiService', ['getAssessmentById']);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirm']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showError']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentProfileId: 's1' });

    assessmentApiSpy.getAssessmentById.and.returnValue(of(futureAssessment));

    TestBed.configureTestingModule({
      declarations: [MyRegistrationsPageComponent],
      providers: [
        Title,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RegistrationApiService, useValue: registrationApiSpy },
        { provide: AssessmentApiService, useValue: assessmentApiSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(MyRegistrationsPageComponent);
    component = fixture.componentInstance;
  });

  function initWithRegistration(status: RegistrationStatus): void {
    registrationApiSpy.getStudentRegistrations.and.returnValue(of([buildRegistration(status)]));
    component.ngOnInit();
  }

  it('derives canCancel=true for a REGISTERED, upcoming registration', () => {
    initWithRegistration(RegistrationStatus.REGISTERED);
    expect(component.visibleRows[0].canCancel).toBe(true);
    expect(component.visibleRows[0].canReRegister).toBe(false);
  });

  it('derives canReRegister=true for a CANCELLED, upcoming registration', () => {
    initWithRegistration(RegistrationStatus.CANCELLED);
    expect(component.visibleRows[0].canReRegister).toBe(true);
    expect(component.visibleRows[0].canCancel).toBe(false);
  });

  it('onCancel opens the confirmation dialog with the assessment title', () => {
    initWithRegistration(RegistrationStatus.REGISTERED);
    dialogServiceSpy.confirm.and.returnValue(of(false));

    component.onCancel(component.visibleRows[0]);

    expect(dialogServiceSpy.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({ bodyMessage: jasmine.stringContaining('Java Fundamentals') }),
    );
  });

  it('does not call cancelRegistration when the dialog is dismissed', () => {
    initWithRegistration(RegistrationStatus.REGISTERED);
    dialogServiceSpy.confirm.and.returnValue(of(false));

    component.onCancel(component.visibleRows[0]);

    expect(registrationApiSpy.cancelRegistration).not.toHaveBeenCalled();
  });

  it('on confirm, calls cancelRegistration and updates the row status to CANCELLED', () => {
    initWithRegistration(RegistrationStatus.REGISTERED);
    dialogServiceSpy.confirm.and.returnValue(of(true));
    registrationApiSpy.cancelRegistration.and.returnValue(of(buildRegistration(RegistrationStatus.CANCELLED)));

    const row = component.visibleRows[0];
    component.onCancel(row);

    expect(registrationApiSpy.cancelRegistration).toHaveBeenCalledWith('r1');
    expect(row.registration.status).toBe(RegistrationStatus.CANCELLED);
    expect(row.isActioning).toBe(false);
  });

  it('onReRegister mirrors onCancel: confirm -> reRegisterForAssessment -> status REGISTERED', () => {
    initWithRegistration(RegistrationStatus.CANCELLED);
    dialogServiceSpy.confirm.and.returnValue(of(true));
    registrationApiSpy.reRegisterForAssessment.and.returnValue(of(buildRegistration(RegistrationStatus.REGISTERED)));

    const row = component.visibleRows[0];
    component.onReRegister(row);

    expect(registrationApiSpy.reRegisterForAssessment).toHaveBeenCalledWith('r1');
    expect(row.registration.status).toBe(RegistrationStatus.REGISTERED);
  });

  it('shows an error and resets isActioning when cancellation fails', () => {
    initWithRegistration(RegistrationStatus.REGISTERED);
    dialogServiceSpy.confirm.and.returnValue(of(true));
    registrationApiSpy.cancelRegistration.and.returnValue(
      throwError(() => ({ message: 'Cannot cancel a past registration.' })),
    );

    const row = component.visibleRows[0];
    component.onCancel(row);

    expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Cannot cancel a past registration.');
    expect(row.isActioning).toBe(false);
  });
});
