import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Component({
  template: `
    <button id="trigger">Open</button>
    <app-confirmation-dialog
      *ngIf="isOpen"
      title="Cancel registration?"
      bodyMessage="This action cannot be undone."
      confirmLabel="Leave"
      cancelLabel="Stay"
      (confirmed)="onConfirmed()"
      (cancelled)="onCancelled()"
    ></app-confirmation-dialog>
  `,
})
class HostComponent {
  isOpen = false;
  confirmedCalled = false;
  cancelledCalled = false;

  onConfirmed(): void {
    this.confirmedCalled = true;
  }

  onCancelled(): void {
    this.cancelledCalled = true;
  }
}

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationDialogComponent, HostComponent],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function open(): void {
    host.isOpen = true;
    fixture.detectChanges();
  }

  function confirmButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.confirmation-dialog__button--primary')).nativeElement;
  }

  function cancelButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.confirmation-dialog__button--secondary')).nativeElement;
  }

  function dialogHost(): HTMLElement {
    return fixture.debugElement.query(By.directive(ConfirmationDialogComponent)).nativeElement;
  }

  it('emits confirmed on Confirm click', () => {
    open();
    confirmButton().click();
    expect(host.confirmedCalled).toBe(true);
    expect(host.cancelledCalled).toBe(false);
  });

  it('emits cancelled on Cancel click', () => {
    open();
    cancelButton().click();
    expect(host.cancelledCalled).toBe(true);
    expect(host.confirmedCalled).toBe(false);
  });

  it('emits cancelled on Escape key', () => {
    open();
    dialogHost().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(host.cancelledCalled).toBe(true);
  });

  it('moves focus to the confirm button on open', () => {
    open();
    expect(document.activeElement).toBe(confirmButton());
  });

  it('traps Tab within the dialog, wrapping from the last to the first focusable element', () => {
    open();
    confirmButton().focus();
    dialogHost().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(cancelButton());
  });

  it('wraps Shift+Tab from the first back to the last focusable element', () => {
    open();
    cancelButton().focus();
    dialogHost().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(confirmButton());
  });

  it('returns focus to the trigger element when the dialog closes', () => {
    const trigger: HTMLButtonElement = fixture.debugElement.query(By.css('#trigger')).nativeElement;
    trigger.focus();

    open();
    expect(document.activeElement).not.toBe(trigger);

    host.isOpen = false;
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger);
  });
});
