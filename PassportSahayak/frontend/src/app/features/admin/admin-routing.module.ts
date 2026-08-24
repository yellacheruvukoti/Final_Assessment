import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KbDocumentsComponent } from './kb-documents/kb-documents.component';

const routes: Routes = [
  { path: '', redirectTo: 'kb', pathMatch: 'full' },
  { path: 'kb', component: KbDocumentsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
