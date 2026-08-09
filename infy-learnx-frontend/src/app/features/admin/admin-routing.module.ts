import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardPageComponent } from './pages/dashboard/admin-dashboard-page.component';
import { CertificateManagementPageComponent } from './pages/certificate-management/certificate-management-page.component';
import { InstructorCreatePageComponent } from './pages/instructor-create/instructor-create-page.component';
import { InstructorEditPageComponent } from './pages/instructor-edit/instructor-edit-page.component';
import { StudentCreatePageComponent } from './pages/student-create/student-create-page.component';
import { StudentEditPageComponent } from './pages/student-edit/student-edit-page.component';
import { UserManagementPageComponent } from './pages/user-management/user-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardPageComponent,
        data: { title: 'Admin Dashboard' },
      },
      { path: 'users', component: UserManagementPageComponent, data: { title: 'User Management' } },
      {
        path: 'users/students/new',
        component: StudentCreatePageComponent,
        data: { title: 'Add Student' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'users/students/:userId/edit',
        component: StudentEditPageComponent,
        data: { title: 'Edit Student' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'users/instructors/new',
        component: InstructorCreatePageComponent,
        data: { title: 'Add Instructor' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'users/instructors/:userId/edit',
        component: InstructorEditPageComponent,
        data: { title: 'Edit Instructor' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'certificates',
        component: CertificateManagementPageComponent,
        data: { title: 'Certificate Management' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
