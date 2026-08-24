import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { KbDocumentsComponent } from './kb-documents/kb-documents.component';

@NgModule({
  declarations: [KbDocumentsComponent],
  imports: [SharedModule, AdminRoutingModule]
})
export class AdminModule {}
