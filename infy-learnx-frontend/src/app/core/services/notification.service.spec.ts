import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NotificationService, ToastState } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NotificationService] });
    service = TestBed.inject(NotificationService);
  });

  function latestToast(): ToastState {
    let value!: ToastState;
    service.currentToast$.subscribe((toast) => (value = toast));
    return value;
  }

  it('emits an initial hidden info state', () => {
    const toast = latestToast();
    expect(toast.visible).toBe(false);
    expect(toast.type).toBe('info');
  });

  it('showSuccess() emits a visible success toast', () => {
    service.showSuccess('Saved successfully.');
    const toast = latestToast();
    expect(toast).toEqual({ type: 'success', message: 'Saved successfully.', visible: true });
  });

  it('showError() emits a visible error toast', () => {
    service.showError('Something failed.');
    const toast = latestToast();
    expect(toast).toEqual({ type: 'error', message: 'Something failed.', visible: true });
  });

  it('showInfo() emits a visible info toast', () => {
    service.showInfo('Heads up.');
    const toast = latestToast();
    expect(toast).toEqual({ type: 'info', message: 'Heads up.', visible: true });
  });

  it('showSuccess() auto-dismisses after 4000ms', fakeAsync(() => {
    service.showSuccess('Saved successfully.');
    expect(latestToast().visible).toBe(true);

    tick(3999);
    expect(latestToast().visible).toBe(true);

    tick(1);
    expect(latestToast().visible).toBe(false);
  }));

  it('showError() does not auto-dismiss', fakeAsync(() => {
    service.showError('Something failed.');
    expect(latestToast().visible).toBe(true);

    tick(10000);
    expect(latestToast().visible).toBe(true);
  }));

  it('dismiss() hides the current toast immediately', () => {
    service.showSuccess('Saved successfully.');
    service.dismiss();
    expect(latestToast().visible).toBe(false);
  });

  it('a new toast call cancels a pending auto-dismiss timer from the previous one', fakeAsync(() => {
    service.showSuccess('First message.');
    tick(3000);
    service.showSuccess('Second message.');

    tick(3000);
    expect(latestToast().visible).toBe(true);
    expect(latestToast().message).toBe('Second message.');

    tick(1000);
    expect(latestToast().visible).toBe(false);
  }));
});
