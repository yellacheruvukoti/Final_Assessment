import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import {
  ApplicationResponse, ApplicationType, BookletType, DocumentChecklistResponse,
  FeeEstimateResponse, ServiceScheme, TatkalReason
} from '../../../core/models/application.model';

@Component({
  selector: 'ps-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent {
  applicationTypes: { value: ApplicationType; label: string }[] = [
    { value: 'FRESH', label: 'Fresh Application' },
    { value: 'REISSUE_RENEWAL', label: 'Renewal / Re-issue' },
    { value: 'REISSUE_LOST_DAMAGED', label: 'Lost / Damaged Passport' },
    { value: 'REISSUE_NAME_CHANGE', label: 'Name / Personal Detail Change' }
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

  detailsForm = this.fb.group({
    applicationType: ['FRESH' as ApplicationType, Validators.required],
    serviceScheme: ['NORMAL' as ServiceScheme, Validators.required],
    bookletType: ['STANDARD_36' as BookletType, Validators.required],
    dateOfBirth: [null as Date | null, Validators.required],
    tatkalReason: [null as TatkalReason | null]
  });

  checklist: DocumentChecklistResponse | null = null;
  loadingChecklist = false;

  fee: FeeEstimateResponse | null = null;
  loadingFee = false;

  submitting = false;
  createdApplication: ApplicationResponse | null = null;

  constructor(private fb: FormBuilder, private applicationService: ApplicationService) {}

  get isMinor(): boolean {
    const dob = this.detailsForm.controls.dateOfBirth.value;
    if (!dob) return false;
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age < 18;
  }

  get isTatkal(): boolean {
    return this.detailsForm.controls.serviceScheme.value === 'TATKAL';
  }

  loadChecklist(): void {
    const applicationType = this.detailsForm.controls.applicationType.value!;
    this.loadingChecklist = true;
    this.applicationService.getDocumentChecklist(applicationType, this.isMinor)
      .pipe(finalize(() => (this.loadingChecklist = false)))
      .subscribe((res) => (this.checklist = res));
  }

  loadFee(): void {
    const v = this.detailsForm.getRawValue();
    if (this.isMinor) {
      this.detailsForm.controls.bookletType.setValue('STANDARD_36');
    }
    this.loadingFee = true;
    this.applicationService.getFeeEstimate(v.applicationType!, v.serviceScheme!, v.bookletType!, this.isMinor)
      .pipe(finalize(() => (this.loadingFee = false)))
      .subscribe((res) => (this.fee = res));
  }

  submit(): void {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    const v = this.detailsForm.getRawValue();
    this.submitting = true;
    this.applicationService.create({
      applicationType: v.applicationType!,
      serviceScheme: v.serviceScheme!,
      bookletType: v.bookletType!,
      dateOfBirth: this.toIsoDate(v.dateOfBirth!),
      tatkalReason: this.isTatkal ? v.tatkalReason : null
    }).pipe(finalize(() => (this.submitting = false)))
      .subscribe((res) => (this.createdApplication = res));
  }

  private toIsoDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
