import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfficialDashboardComponent } from './dashboard/dashboard.component';
import { ApplicationsQueueComponent } from './applications-queue/applications-queue.component';
import { PvQueueComponent } from './pv-queue/pv-queue.component';
import { GrievancesQueueComponent } from './grievances-queue/grievances-queue.component';
import { AppealsQueueComponent } from './appeals-queue/appeals-queue.component';
import { FraudQueueComponent } from './fraud-queue/fraud-queue.component';
import { CapacityComponent } from './capacity/capacity.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: OfficialDashboardComponent },
  { path: 'applications', component: ApplicationsQueueComponent },
  { path: 'pv', component: PvQueueComponent },
  { path: 'grievances', component: GrievancesQueueComponent },
  { path: 'appeals', component: AppealsQueueComponent },
  { path: 'fraud', component: FraudQueueComponent },
  { path: 'capacity', component: CapacityComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfficialRoutingModule {}
