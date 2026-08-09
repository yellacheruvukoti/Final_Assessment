import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { ApiError } from '../../../../core/models/api-response.model';
import { LoginService } from '../../services/login.service';

// Merges I-01 (page shell) and J-01 (form wiring) — both target this same
// file with sequential/overlapping acceptance criteria, so building it
// twice would mean redoing the same work.
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  readonly form: FormGroup = this.formBuilder.group({
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      updateOn: 'blur',
    }),
    password: this.formBuilder.control('', {
      validators: [Validators.required],
      updateOn: 'blur',
    }),
  });

  isSubmitting = false;
  formError: string | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly loginService: LoginService,
    private readonly titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Login | Infy_LearnX');
  }

  get email(): AbstractControl {
    return this.form.controls['email'];
  }

  get password(): AbstractControl {
    return this.form.controls['password'];
  }

  onSubmit(): void {
    this.formError = null;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.loginService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting = false;
      },
      error: (error: ApiError) => {
        this.isSubmitting = false;
        this.formError = error?.message ?? 'Unable to log in. Please try again.';
      },
    });
  }

  emailErrorMessage(): string | null {
    if (!this.email.touched || !this.email.invalid) {
      return null;
    }
    if (this.email.hasError('required')) {
      return 'Email is required.';
    }
    if (this.email.hasError('email')) {
      return 'Enter a valid email address.';
    }
    return null;
  }

  passwordErrorMessage(): string | null {
    if (!this.password.touched || !this.password.invalid) {
      return null;
    }
    if (this.password.hasError('required')) {
      return 'Password is required.';
    }
    return null;
  }
}
