import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EligibilityComponent } from './eligibility/eligibility.component';
import { ApplyComponent } from './apply/apply.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { GrievancesComponent } from './grievances/grievances.component';
import { AppealsComponent } from './appeals/appeals.component';
import { FraudReportComponent } from './fraud-report/fraud-report.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'eligibility', component: EligibilityComponent },
  { path: 'apply', component: ApplyComponent },
  { path: 'applications', component: MyApplicationsComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'grievances', component: GrievancesComponent },
  { path: 'appeals', component: AppealsComponent },
  { path: 'fraud-report', component: FraudReportComponent },
  { path: 'chat', component: ChatComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicantRoutingModule {}
