import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  type: ToastType;
  message: string;
  visible: boolean;
}

const AUTO_DISMISS_MS = 4000;

const INITIAL_STATE: ToastState = { type: 'info', message: '', visible: false };

// Root-level toast notification state (frontend-constitution.md Section
// 9.3). Only one toast is ever active; a new call replaces whatever is
// currently showing.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastSubject = new BehaviorSubject<ToastState>(INITIAL_STATE);
  readonly currentToast$: Observable<ToastState> = this.toastSubject.asObservable();

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  showSuccess(message: string): void {
    this.show('success', message, AUTO_DISMISS_MS);
  }

  showError(message: string): void {
    this.show('error', message, null);
  }

  showInfo(message: string): void {
    this.show('info', message, AUTO_DISMISS_MS);
  }

  dismiss(): void {
    this.clearTimer();
    this.toastSubject.next({ ...this.toastSubject.value, visible: false });
  }

  private show(type: ToastType, message: string, autoDismissMs: number | null): void {
    this.clearTimer();
    this.toastSubject.next({ type, message, visible: true });
    if (autoDismissMs !== null) {
      this.dismissTimer = setTimeout(() => this.dismiss(), autoDismissMs);
    }
  }

  private clearTimer(): void {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
