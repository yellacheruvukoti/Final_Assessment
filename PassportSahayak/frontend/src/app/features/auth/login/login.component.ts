import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ps-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth.shared.scss']
})
export class LoginComponent {
  loading = false;
  hidePassword = true;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.login(this.form.getRawValue() as { email: string; password: string })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const home = res.user.role === 'APPLICANT' ? '/applicant'
            : res.user.role === 'ADMIN' ? '/admin/kb' : '/official';
          this.router.navigate([home]);
        }
      });
  }
}
