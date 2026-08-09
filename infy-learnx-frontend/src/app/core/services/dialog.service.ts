import { ApplicationRef, ComponentRef, EnvironmentInjector, Injectable, createComponent } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

export interface ConfirmDialogConfig {
  title: string;
  bodyMessage: string;
  confirmLabel: string;
  cancelLabel: string;
}

// Not itself a task deliverable — necessary infrastructure so route guards
// and page components can show the real ConfirmationDialogComponent
// without a ViewContainerRef of their own (guards have none at all; pages
// would need one wired specifically for this). Uses Angular's imperative
// createComponent + ApplicationRef.attachView to mount the dialog directly
// on document.body and tear it down afterward, avoiding a dependency on
// Angular CDK (not installed in this project).
@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: EnvironmentInjector,
  ) {}

  confirmUnsavedChanges(): Observable<boolean> {
    return this.confirm({
      title: 'Unsaved changes',
      bodyMessage: 'You have unsaved changes. Are you sure you want to leave this page?',
      confirmLabel: 'Leave',
      cancelLabel: 'Stay',
    });
  }

  // Generic destructive-action confirmation (frontend-constitution.md
  // Section 11.4.6 — used for registration cancellation, re-registration,
  // and certificate revocation).
  confirm(config: ConfirmDialogConfig): Observable<boolean> {
    const componentRef: ComponentRef<ConfirmationDialogComponent> = createComponent(
      ConfirmationDialogComponent,
      { environmentInjector: this.injector },
    );

    componentRef.instance.title = config.title;
    componentRef.instance.bodyMessage = config.bodyMessage;
    componentRef.instance.confirmLabel = config.confirmLabel;
    componentRef.instance.cancelLabel = config.cancelLabel;
    componentRef.changeDetectorRef.detectChanges();

    document.body.appendChild(componentRef.location.nativeElement);
    this.appRef.attachView(componentRef.hostView);

    const cleanup = (): void => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    };

    return new Observable<boolean>((subscriber) => {
      const confirmedSub = componentRef.instance.confirmed.subscribe(() => {
        subscriber.next(true);
        subscriber.complete();
      });
      const cancelledSub = componentRef.instance.cancelled.subscribe(() => {
        subscriber.next(false);
        subscriber.complete();
      });

      return () => {
        confirmedSub.unsubscribe();
        cancelledSub.unsubscribe();
        cleanup();
      };
    });
  }
}
