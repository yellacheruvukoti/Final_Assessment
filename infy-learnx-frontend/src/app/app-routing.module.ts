import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutes } from './core/constants/app-routes.constants';
import { UserRole } from './core/constants/role.constants';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { NotFoundPageComponent } from './features/shared-pages/not-found-page.component';
import { ServiceUnavailablePageComponent } from './features/shared-pages/service-unavailable-page.component';

// Root routing table (frontend-constitution.md Section 4). Every feature
// module is lazy-loaded and role-guarded per Section 4.3.
const routes: Routes = [
  {
    path: AppRoutes.login,
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: AppRoutes.student.root,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: UserRole.STUDENT },
    loadChildren: () => import('./features/student/student.module').then((m) => m.StudentModule),
  },
  {
    path: AppRoutes.instructor.root,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: UserRole.INSTRUCTOR },
    loadChildren: () =>
      import('./features/instructor/instructor.module').then((m) => m.InstructorModule),
  },
  {
    path: AppRoutes.admin.root,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: UserRole.ADMINISTRATOR },
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule),
  },
  { path: AppRoutes.notFound, component: NotFoundPageComponent },
  { path: AppRoutes.serviceUnavailable, component: ServiceUnavailablePageComponent },
  { path: '', redirectTo: AppRoutes.login, pathMatch: 'full' },
  { path: '**', redirectTo: AppRoutes.notFound },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
