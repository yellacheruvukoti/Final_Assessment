import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShellComponent } from './shared/components/shell/shell.component';
import { AuthGuard, RoleGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'applicant', pathMatch: 'full' },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'applicant',
        canActivate: [RoleGuard],
        data: { roles: ['APPLICANT'] },
        loadChildren: () => import('./features/applicant/applicant.module').then((m) => m.ApplicantModule)
      },
      {
        path: 'official',
        canActivate: [RoleGuard],
        data: { roles: ['PSK_OFFICIAL', 'RPO_OFFICIAL', 'ADMIN'] },
        loadChildren: () => import('./features/official/official.module').then((m) => m.OfficialModule)
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule)
  },
  { path: '**', redirectTo: 'applicant' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
