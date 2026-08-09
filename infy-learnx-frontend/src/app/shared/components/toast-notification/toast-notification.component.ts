import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { NotificationService, ToastState } from '../../../core/services/notification.service';

// Root-level toast host (frontend-constitution.md Section 11.3). Rendered
// once in AppComponent, not per-page. Reads NotificationService via the
// async pipe rather than subscribe(), per Section 10.6.2.
@Component({
  selector: 'app-toast-notification',
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastNotificationComponent {
  readonly toast$: Observable<ToastState> = this.notificationService.currentToast$;

  constructor(private readonly notificationService: NotificationService) {}

  dismiss(): void {
    this.notificationService.dismiss();
  }
}
