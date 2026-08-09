import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { RegistrationResponse } from '../../../../core/models/registration.model';

@Component({
  selector: '[app-registration-row]',
  templateUrl: './registration-row.component.html',
  styleUrls: ['./registration-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationRowComponent {
  @Input({ required: true }) registration!: RegistrationResponse;
  @Input() assessmentTitle = '';
  @Input() assessmentStartTime = '';
  @Input() canCancel = false;
  @Input() canReRegister = false;
  @Input() isActioning = false;

  @Output() readonly cancel = new EventEmitter<void>();
  @Output() readonly reRegister = new EventEmitter<void>();
}
