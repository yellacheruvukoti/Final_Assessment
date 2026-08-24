import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

const MODULES = [
  MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule,
  MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule,
  MatNativeDateModule, MatTableModule, MatPaginatorModule, MatSnackBarModule, MatDialogModule,
  MatChipsModule, MatTabsModule, MatStepperModule, MatProgressSpinnerModule, MatProgressBarModule,
  MatMenuModule, MatDividerModule, MatTooltipModule, MatBadgeModule, MatExpansionModule,
  MatCheckboxModule, MatRadioModule, MatButtonToggleModule, MatSlideToggleModule
];

@NgModule({
  imports: MODULES,
  exports: MODULES
})
export class PsMaterialModule {}
