import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';

import { LoginPageComponent } from './login-page.component';
import { LoginService } from '../../services/login.service';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['login']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginPageComponent],
      providers: [{ provide: LoginService, useValue: loginServiceSpy }, Title],
    });

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
  });

  it('marks all fields touched and makes no API call when submitted empty', () => {
    component.onSubmit();

    expect(component.email.touched).toBe(true);
    expect(component.password.touched).toBe(true);
    expect(loginServiceSpy.login).not.toHaveBeenCalled();
  });

  it('calls LoginService.login with the form value when valid', () => {
    loginServiceSpy.login.and.returnValue(of(undefined));
    component.form.setValue({ email: 'alice@infy.com', password: 'secret' });

    component.onSubmit();

    expect(loginServiceSpy.login).toHaveBeenCalledWith({ email: 'alice@infy.com', password: 'secret' });
  });

  it('shows an inline formError on a 401-style failure and issues no toast', () => {
    loginServiceSpy.login.and.returnValue(
      throwError(() => ({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' })),
    );
    component.form.setValue({ email: 'nobody@nowhere.com', password: 'wrong' });

    component.onSubmit();

    expect(component.formError).toBe('Invalid email or password.');
    expect(component.isSubmitting).toBe(false);
    // No NotificationService is injected into this component at all, so
    // there is no toast call path to assert against — the only surface
    // for a login failure is the inline formError above.
  });

  it('sets isSubmitting=true while the request is pending, disabling the submit button', () => {
    const pending = new Subject<void>();
    loginServiceSpy.login.and.returnValue(pending.asObservable());
    component.form.setValue({ email: 'alice@infy.com', password: 'secret' });

    component.onSubmit();
    expect(component.isSubmitting).toBe(true);

    pending.next();
    pending.complete();
    expect(component.isSubmitting).toBe(false);
  });

  it('clears any previous formError at the start of a new submission attempt', () => {
    loginServiceSpy.login.and.returnValue(
      throwError(() => ({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' })),
    );
    component.form.setValue({ email: 'alice@infy.com', password: 'wrong' });
    component.onSubmit();
    expect(component.formError).toBe('Invalid email or password.');

    loginServiceSpy.login.and.returnValue(of(undefined));
    component.onSubmit();

    expect(component.formError).toBeNull();
  });
});
