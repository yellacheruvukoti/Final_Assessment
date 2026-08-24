import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ApplicantRoutingModule } from './applicant-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EligibilityComponent } from './eligibility/eligibility.component';
import { ApplyComponent } from './apply/apply.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { GrievancesComponent } from './grievances/grievances.component';
import { AppealsComponent } from './appeals/appeals.component';
import { FraudReportComponent } from './fraud-report/fraud-report.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [
    DashboardComponent, EligibilityComponent, ApplyComponent, MyApplicationsComponent,
    AppointmentsComponent, GrievancesComponent, AppealsComponent, FraudReportComponent, ChatComponent
  ],
  imports: [SharedModule, ApplicantRoutingModule]
})
export class ApplicantModule {}
