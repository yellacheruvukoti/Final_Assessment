import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Modal overlay used for all destructive actions (frontend-constitution.md
// Section 11.4). The parent controls presence via *ngIf; this component
// only emits confirmed/cancelled — the parent removes it from the DOM in
// response, which is what triggers ngOnDestroy's focus restoration.
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() bodyMessage = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';

  @Output() readonly confirmed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();

  @ViewChild('panel') private readonly panelRef?: ElementRef<HTMLElement>;
  @ViewChild('confirmButton') private readonly confirmButtonRef?: ElementRef<HTMLElement>;

  private triggerElement: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.triggerElement = document.activeElement as HTMLElement | null;
    this.confirmButtonRef?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.triggerElement?.focus();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  // Plain keydown + manual key/modifier checks rather than Angular's
  // `keydown.tab` pseudo-event syntax — that syntax requires an exact
  // modifier match, so it silently misses Shift+Tab and would break
  // reverse focus trapping.
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelled.emit();
      return;
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.panelRef) {
      return [];
    }
    return Array.from(this.panelRef.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }
}
