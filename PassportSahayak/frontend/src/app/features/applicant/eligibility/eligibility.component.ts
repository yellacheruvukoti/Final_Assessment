import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import { EligibilityCheckResponse, ExistingPassportStatus, TatkalReason } from '../../../core/models/application.model';

@Component({
  selector: 'ps-eligibility',
  templateUrl: './eligibility.component.html',
  styleUrls: ['./eligibility.component.scss']
})
export class EligibilityComponent {
  loading = false;
  result: EligibilityCheckResponse | null = null;
  today = new Date();

  passportStatuses: { value: ExistingPassportStatus; label: string }[] = [
    { value: 'NONE', label: 'I have never held a passport' },
    { value: 'VALID', label: 'Valid, but pages exhausted / need name change' },
    { value: 'EXPIRED', label: 'My passport has expired' },
    { value: 'LOST', label: 'My passport is lost' },
    { value: 'DAMAGED', label: 'My passport is damaged' }
  ];

  tatkalReasons: { value: TatkalReason; label: string }[] = [
    { value: 'MEDICAL_EMERGENCY', label: 'Medical emergency' },
    { value: 'DEATH_OF_RELATIVE_ABROAD', label: 'Death of a close relative abroad' },
    { value: 'EMPLOYMENT_VISA', label: 'Employment / work visa' },
    { value: 'EDUCATION_VISA', label: 'Education visa / admission deadline' },
    { value: 'COURT_LEGAL_SUMMONS', label: 'Court / legal summons abroad' },
    { value: 'PASSPORT_EXPIRY_WITH_TRAVEL', label: 'Passport expiry with confirmed travel' },
    { value: 'SPORTS_CULTURAL_EVENT', label: 'Sports / cultural event representing India' }
  ];

  form = this.fb.group({
    dateOfBirth: [null as Date | null],
    existingPassportStatus: ['NONE' as ExistingPassportStatus],
    addressChangedSinceLastPassport: [false],
    pagesExhausted: [false],
    wantsTatkal: [false],
    tatkalReason: [null as TatkalReason | null],
    travelWithinDays: [null as number | null]
  });

  constructor(private fb: FormBuilder, private applicationService: ApplicationService) {}

  submit(): void {
    const v = this.form.getRawValue();
    if (!v.dateOfBirth) {
      return;
    }
    this.loading = true;
    this.result = null;
    this.applicationService.checkEligibility({
      dateOfBirth: this.toIsoDate(v.dateOfBirth),
      existingPassportStatus: v.existingPassportStatus!,
      addressChangedSinceLastPassport: !!v.addressChangedSinceLastPassport,
      pagesExhausted: !!v.pagesExhausted,
      tatkalReason: v.wantsTatkal ? v.tatkalReason : null,
      travelWithinDays: v.travelWithinDays
    }).pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => (this.result = res));
  }

  private toIsoDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
