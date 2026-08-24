import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'ps-register',
  templateUrl: './register.component.html',
  styleUrls: ['../auth.shared.scss']
})
export class RegisterComponent {
  loading = false;
  hidePassword = true;

  roles: { value: Role; label: string }[] = [
    { value: 'APPLICANT', label: 'Applicant (Citizen)' },
    { value: 'PSK_OFFICIAL', label: 'PSK Official' },
    { value: 'RPO_OFFICIAL', label: 'RPO Official' },
    { value: 'ADMIN', label: 'Admin (KB Administrator)' }
  ];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['APPLICANT' as Role, [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.register(this.form.getRawValue() as any)
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
