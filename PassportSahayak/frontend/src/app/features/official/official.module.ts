import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { OfficialRoutingModule } from './official-routing.module';
import { OfficialDashboardComponent } from './dashboard/dashboard.component';
import { ApplicationsQueueComponent } from './applications-queue/applications-queue.component';
import { PvQueueComponent } from './pv-queue/pv-queue.component';
import { GrievancesQueueComponent } from './grievances-queue/grievances-queue.component';
import { AppealsQueueComponent } from './appeals-queue/appeals-queue.component';
import { FraudQueueComponent } from './fraud-queue/fraud-queue.component';
import { CapacityComponent } from './capacity/capacity.component';

@NgModule({
  declarations: [
    OfficialDashboardComponent, ApplicationsQueueComponent, PvQueueComponent, GrievancesQueueComponent,
    AppealsQueueComponent, FraudQueueComponent, CapacityComponent
  ],
  imports: [SharedModule, OfficialRoutingModule]
})
export class OfficialModule {}
