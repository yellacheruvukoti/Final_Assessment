import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SidebarNavComponent } from './components/sidebar-nav/sidebar-nav.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { ToastNotificationComponent } from './components/toast-notification/toast-notification.component';

// Declares and exports every shared/components/* component
// (frontend-constitution.md Section 2.3). This completes the C group — all
// shared components now live here. Must never import CoreModule or a
// feature module.
@NgModule({
  declarations: [
    SkeletonLoaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    PageHeaderComponent,
    ToastNotificationComponent,
    ConfirmationDialogComponent,
    SidebarNavComponent,
    DataTableComponent,
  ],
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    PageHeaderComponent,
    ToastNotificationComponent,
    ConfirmationDialogComponent,
    SidebarNavComponent,
    DataTableComponent,
  ],
})
export class SharedModule {}
