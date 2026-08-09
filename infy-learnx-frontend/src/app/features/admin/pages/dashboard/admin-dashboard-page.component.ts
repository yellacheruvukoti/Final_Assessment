import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { UserRole } from '../../../../core/constants/role.constants';
import { CertificateStatus } from '../../../../core/models/certificate.model';
import { AdminCertificateApiService } from '../../services/admin-certificate-api.service';
import { AdminUserApiService } from '../../services/admin-user-api.service';

interface CardState {
  isLoading: boolean;
  hasError: boolean;
  value: number | null;
}

const INITIAL_CARD: CardState = { isLoading: true, hasError: false, value: null };

@Component({
  selector: 'app-admin-dashboard-page',
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.scss'],
})
export class AdminDashboardPageComponent implements OnInit {
  totalUsersCard: CardState = { ...INITIAL_CARD };
  totalStudentsCard: CardState = { ...INITIAL_CARD };
  totalInstructorsCard: CardState = { ...INITIAL_CARD };
  issuedCertificatesCard: CardState = { ...INITIAL_CARD };

  constructor(
    private readonly titleService: Title,
    private readonly adminUserApiService: AdminUserApiService,
    private readonly adminCertificateApiService: AdminCertificateApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Admin Dashboard | Infy_LearnX');
    this.loadTotalUsers();
    this.loadTotalStudents();
    this.loadTotalInstructors();
    this.loadIssuedCertificates();
  }

  retryTotalUsers(): void {
    this.loadTotalUsers();
  }

  retryTotalStudents(): void {
    this.loadTotalStudents();
  }

  retryTotalInstructors(): void {
    this.loadTotalInstructors();
  }

  retryIssuedCertificates(): void {
    this.loadIssuedCertificates();
  }

  private loadTotalUsers(): void {
    this.totalUsersCard = { ...INITIAL_CARD };
    this.adminUserApiService.getUsers().subscribe({
      next: (users) => (this.totalUsersCard = { isLoading: false, hasError: false, value: users.length }),
      error: () => (this.totalUsersCard = { isLoading: false, hasError: true, value: null }),
    });
  }

  private loadTotalStudents(): void {
    this.totalStudentsCard = { ...INITIAL_CARD };
    this.adminUserApiService.getUsers({ role: UserRole.STUDENT }).subscribe({
      next: (users) => (this.totalStudentsCard = { isLoading: false, hasError: false, value: users.length }),
      error: () => (this.totalStudentsCard = { isLoading: false, hasError: true, value: null }),
    });
  }

  private loadTotalInstructors(): void {
    this.totalInstructorsCard = { ...INITIAL_CARD };
    this.adminUserApiService.getUsers({ role: UserRole.INSTRUCTOR }).subscribe({
      next: (users) => (this.totalInstructorsCard = { isLoading: false, hasError: false, value: users.length }),
      error: () => (this.totalInstructorsCard = { isLoading: false, hasError: true, value: null }),
    });
  }

  private loadIssuedCertificates(): void {
    this.issuedCertificatesCard = { ...INITIAL_CARD };
    this.adminCertificateApiService.getCertificates({ status: CertificateStatus.ISSUED }).subscribe({
      next: (certificates) =>
        (this.issuedCertificatesCard = { isLoading: false, hasError: false, value: certificates.length }),
      error: () => (this.issuedCertificatesCard = { isLoading: false, hasError: true, value: null }),
    });
  }
}
