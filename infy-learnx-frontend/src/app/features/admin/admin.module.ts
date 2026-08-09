import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardPageComponent } from './pages/dashboard/admin-dashboard-page.component';
import { CertificateManagementPageComponent } from './pages/certificate-management/certificate-management-page.component';
import { InstructorCreatePageComponent } from './pages/instructor-create/instructor-create-page.component';
import { InstructorEditPageComponent } from './pages/instructor-edit/instructor-edit-page.component';
import { StudentCreatePageComponent } from './pages/student-create/student-create-page.component';
import { StudentEditPageComponent } from './pages/student-edit/student-edit-page.component';
import { UserManagementPageComponent } from './pages/user-management/user-management-page.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardPageComponent,
    UserManagementPageComponent,
    CertificateManagementPageComponent,
    StudentCreatePageComponent,
    StudentEditPageComponent,
    InstructorCreatePageComponent,
    InstructorEditPageComponent,
  ],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule {}
