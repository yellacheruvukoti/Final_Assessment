import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, switchMap } from 'rxjs';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { DEFAULT_PAGE_SIZE } from '../../../../core/constants/pagination.constants';
import { UserRole } from '../../../../core/constants/role.constants';
import { DialogService } from '../../../../core/services/dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserResponse, UserStatus } from '../../../../core/models/user.model';
import { DataTableColumn, SortState } from '../../../../shared/components/data-table/data-table.component';
import { AdminUserApiService } from '../../services/admin-user-api.service';

interface UserRow extends UserResponse {
  isDeactivating: boolean;
}

// role/status are real, respected query params on GET /api/users (verified
// against UserController source) — filtering happens server-side. Sort and
// pagination are still client-side (no sort/page/size params exist).
@Component({
  selector: 'app-user-management-page',
  templateUrl: './user-management-page.component.html',
  styleUrls: ['./user-management-page.component.scss'],
})
export class UserManagementPageComponent implements OnInit {
  readonly columns: DataTableColumn[] = [
    { key: 'userCode', header: 'User Code' },
    { key: 'fullName', header: 'Full Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ];

  private allUsers: UserRow[] = [];
  visibleUsers: UserRow[] = [];

  isLoading = true;
  errorMessage: string | null = null;

  role: UserRole | '' = '';
  status: UserStatus | '' = '';
  currentPage = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  currentSort: SortState = { field: 'fullName', direction: 'asc' };

  totalElements = 0;
  totalPages = 0;

  readonly roleOptions = Object.values(UserRole);
  readonly statusOptions = Object.values(UserStatus);
  readonly UserRole = UserRole;
  readonly UserStatus = UserStatus;
  readonly AppRoutes = AppRoutes;

  constructor(
    private readonly titleService: Title,
    private readonly router: Router,
    private readonly adminUserApiService: AdminUserApiService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('User Management | Infy_LearnX');
    this.load();
  }

  onEdit(row: UserRow): void {
    if (row.role === UserRole.STUDENT) {
      this.router.navigate([`/${AppRoutes.admin.studentEdit(row.userId)}`]);
    } else if (row.role === UserRole.INSTRUCTOR) {
      this.router.navigate([`/${AppRoutes.admin.instructorEdit(row.userId)}`]);
    }
  }

  onDeactivate(row: UserRow): void {
    this.dialogService
      .confirm({
        title: `Deactivate ${row.fullName}?`,
        bodyMessage: 'They will no longer be able to log in. This can be reversed later by editing their status.',
        confirmLabel: 'Deactivate',
        cancelLabel: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.setRowDeactivating(row.userId, true);
        this.deactivateByRole(row).subscribe({
          next: () => {
            const index = this.allUsers.findIndex((u) => u.userId === row.userId);
            if (index !== -1) {
              this.allUsers[index] = { ...this.allUsers[index], status: UserStatus.INACTIVE, isDeactivating: false };
            }
            this.applyClientSideView();
            this.notificationService.showSuccess(`${row.fullName} has been deactivated.`);
          },
          error: (error: { message?: string }) => {
            this.setRowDeactivating(row.userId, false);
            this.notificationService.showError(error?.message ?? 'Unable to deactivate. Please try again.');
          },
        });
      });
  }

  private deactivateByRole(row: UserRow): Observable<void> {
    if (row.role === UserRole.STUDENT) {
      return this.adminUserApiService.getStudentByUserId(row.userId).pipe(
        switchMap((student) => this.adminUserApiService.deactivateStudent(student.studentId)),
      );
    }
    return this.adminUserApiService.getInstructorByUserId(row.userId).pipe(
      switchMap((instructor) => this.adminUserApiService.deactivateInstructor(instructor.instructorId)),
    );
  }

  private setRowDeactivating(userId: string, isDeactivating: boolean): void {
    const index = this.allUsers.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      this.allUsers[index] = { ...this.allUsers[index], isDeactivating };
    }
    this.applyClientSideView();
  }

  onRoleChange(role: UserRole | ''): void {
    this.role = role;
    this.currentPage = 1;
    this.load();
  }

  onStatusChange(status: UserStatus | ''): void {
    this.status = status;
    this.currentPage = 1;
    this.load();
  }

  onSortChange(sort: SortState): void {
    this.currentSort = sort;
    this.applyClientSideView();
  }

  onPageChange(page: number): void {
    this.currentPage = page + 1;
    this.applyClientSideView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyClientSideView();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.adminUserApiService
      .getUsers({ role: this.role || undefined, status: this.status || undefined })
      .subscribe({
        next: (users) => {
          this.allUsers = users.map((user) => ({ ...user, isDeactivating: false }));
          this.applyClientSideView();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Unable to load users. Please try again.';
          this.isLoading = false;
        },
      });
  }

  private applyClientSideView(): void {
    const sorted = [...this.allUsers].sort((a, b) => {
      const aValue = String((a as unknown as Record<string, unknown>)[this.currentSort.field] ?? '');
      const bValue = String((b as unknown as Record<string, unknown>)[this.currentSort.field] ?? '');
      return aValue.localeCompare(bValue);
    });
    if (this.currentSort.direction === 'desc') {
      sorted.reverse();
    }

    this.totalElements = sorted.length;
    this.totalPages = Math.max(1, Math.ceil(sorted.length / this.pageSize));

    const start = (this.currentPage - 1) * this.pageSize;
    this.visibleUsers = sorted.slice(start, start + this.pageSize);
  }
}
