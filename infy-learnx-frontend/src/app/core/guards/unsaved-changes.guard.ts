import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

import { DialogService } from '../services/dialog.service';

export interface ComponentWithUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<ComponentWithUnsavedChanges> {
  constructor(private readonly dialogService: DialogService) {}

  canDeactivate(component: ComponentWithUnsavedChanges): Observable<boolean> | boolean {
    if (!component.hasUnsavedChanges()) {
      return true;
    }
    return this.dialogService.confirmUnsavedChanges();
  }
}
