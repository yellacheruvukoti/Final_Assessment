import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PsMaterialModule } from './material.module';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { StatusChipComponent } from './components/status-chip/status-chip.component';
import { ShellComponent } from './components/shell/shell.component';

@NgModule({
  declarations: [EmptyStateComponent, StatusChipComponent, ShellComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PsMaterialModule],
  exports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PsMaterialModule,
    EmptyStateComponent, StatusChipComponent, ShellComponent
  ]
})
export class SharedModule {}
