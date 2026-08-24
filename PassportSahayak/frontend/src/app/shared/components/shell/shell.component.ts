import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

@Component({
  selector: 'ps-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  applicantNav: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', path: '/applicant' },
    { icon: 'fact_check', label: 'Check Eligibility', path: '/applicant/eligibility' },
    { icon: 'note_add', label: 'Apply for Passport', path: '/applicant/apply' },
    { icon: 'folder_shared', label: 'My Applications', path: '/applicant/applications' },
    { icon: 'event_available', label: 'Appointments', path: '/applicant/appointments' },
    { icon: 'report_problem', label: 'Grievances', path: '/applicant/grievances' },
    { icon: 'gavel', label: 'Appeals', path: '/applicant/appeals' },
    { icon: 'shield', label: 'Report Fraud', path: '/applicant/fraud-report' },
    { icon: 'smart_toy', label: 'AI Assistant', path: '/applicant/chat' }
  ];

  officialNav: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', path: '/official' },
    { icon: 'assignment', label: 'Applications Queue', path: '/official/applications' },
    { icon: 'local_police', label: 'PV Queue', path: '/official/pv' },
    { icon: 'report_problem', label: 'Grievances Queue', path: '/official/grievances' },
    { icon: 'gavel', label: 'Appeals Queue', path: '/official/appeals' },
    { icon: 'shield', label: 'Fraud Queue', path: '/official/fraud' },
    { icon: 'insights', label: 'Capacity Monitor', path: '/official/capacity' }
  ];

  adminNav: NavItem[] = [
    { icon: 'library_books', label: 'Knowledge Base', path: '/admin/kb' }
  ];

  constructor(public auth: AuthService, private router: Router) {}

  get user(): User | null {
    return this.auth.currentUser;
  }

  get isApplicant(): boolean {
    return this.auth.hasRole('APPLICANT');
  }

  get isOfficialOrAdmin(): boolean {
    return this.auth.hasRole('PSK_OFFICIAL', 'RPO_OFFICIAL', 'ADMIN');
  }

  get isAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  roleLabel(): string {
    const map: Record<string, string> = {
      APPLICANT: 'Applicant',
      PSK_OFFICIAL: 'PSK Official',
      RPO_OFFICIAL: 'RPO Official',
      ADMIN: 'Administrator'
    };
    return this.user ? (map[this.user.role] ?? this.user.role) : '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
