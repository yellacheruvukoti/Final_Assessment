import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { CertificateResponse, CertificateStatus } from '../../../../core/models/certificate.model';

@Component({
  selector: '[app-certificate-row]',
  templateUrl: './certificate-row.component.html',
  styleUrls: ['./certificate-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateRowComponent {
  @Input({ required: true }) certificate!: CertificateResponse;
  @Input() assessmentTitle = '';
  @Input() isDownloading = false;

  @Output() readonly download = new EventEmitter<void>();

  readonly CertificateStatus = CertificateStatus;
}
