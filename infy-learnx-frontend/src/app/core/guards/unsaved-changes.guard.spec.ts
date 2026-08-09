import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { DialogService } from '../services/dialog.service';
import { ComponentWithUnsavedChanges, UnsavedChangesGuard } from './unsaved-changes.guard';

describe('UnsavedChangesGuard', () => {
  let guard: UnsavedChangesGuard;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmUnsavedChanges']);

    TestBed.configureTestingModule({
      providers: [UnsavedChangesGuard, { provide: DialogService, useValue: dialogServiceSpy }],
    });

    guard = TestBed.inject(UnsavedChangesGuard);
  });

  function makeComponent(hasUnsavedChanges: boolean): ComponentWithUnsavedChanges {
    return { hasUnsavedChanges: () => hasUnsavedChanges };
  }

  it('allows navigation immediately for a clean form, without opening the dialog', () => {
    const result = guard.canDeactivate(makeComponent(false));
    expect(result).toBe(true);
    expect(dialogServiceSpy.confirmUnsavedChanges).not.toHaveBeenCalled();
  });

  it('opens the confirmation dialog for a dirty form and allows navigation on Leave', (done) => {
    dialogServiceSpy.confirmUnsavedChanges.and.returnValue(of(true));

    const result = guard.canDeactivate(makeComponent(true));
    expect(dialogServiceSpy.confirmUnsavedChanges).toHaveBeenCalled();

    (result as Observable<boolean>).subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
  });

  it('opens the confirmation dialog for a dirty form and blocks navigation on Stay', (done) => {
    dialogServiceSpy.confirmUnsavedChanges.and.returnValue(of(false));

    const result = guard.canDeactivate(makeComponent(true));

    (result as Observable<boolean>).subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });
});
