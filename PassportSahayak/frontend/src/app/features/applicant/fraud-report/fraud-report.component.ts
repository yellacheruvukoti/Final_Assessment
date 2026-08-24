import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { FraudService } from '../../../core/services/fraud.service';
import { ApplicationService } from '../../../core/services/application.service';
import { FraudCategory, FraudReportResponse, ReferralMatrixEntry } from '../../../core/models/fraud.model';
import { ApplicationResponse } from '../../../core/models/application.model';

@Component({
  selector: 'ps-fraud-report',
  templateUrl: './fraud-report.component.html',
  styleUrls: ['./fraud-report.component.scss']
})
export class FraudReportComponent implements OnInit {
  categories: { value: FraudCategory; label: string }[] = [
    { value: 'DOCUMENT_FORGERY', label: 'Document forgery' },
    { value: 'IDENTITY_IMPERSONATION', label: 'Identity impersonation' },
    { value: 'SUPPRESSION_OF_INFO', label: 'Suppression of information' },
    { value: 'AGENT_BROKER_FRAUD', label: 'Agent / broker fraud' },
    { value: 'DUPLICATE_PASSPORT', label: 'Duplicate passport' },
    { value: 'ONLINE_PHISHING', label: 'Online phishing / fake website' },
    { value: 'INTERNAL_MISCONDUCT', label: 'Internal staff misconduct' },
    { value: 'PV_CORRUPTION', label: 'Police verification corruption' }
  ];

  applications: ApplicationResponse[] = [];
  reports: FraudReportResponse[] = [];
  referralMatrix: ReferralMatrixEntry[] = [];

  loading = true;
  submitting = false;
  showMatrix = false;
  columns = ['category', 'arn', 'severity', 'status', 'created'];

  form = this.fb.group({
    arn: [null as string | null],
    category: [null as FraudCategory | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private fb: FormBuilder,
    private fraudService: FraudService,
    private applicationService: ApplicationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const arnFromQuery = this.route.snapshot.queryParamMap.get('arn');
    if (arnFromQuery) {
      this.form.controls.arn.setValue(arnFromQuery);
    }
    this.applicationService.mine().subscribe((res) => (this.applications = res));
    this.fraudService.referralMatrix().subscribe((res) => (this.referralMatrix = res));
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.fraudService.mine()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => (this.reports = res));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitting = true;
    this.fraudService.file({
      arn: v.arn || null,
      category: v.category!,
      description: v.description!
    }).pipe(finalize(() => (this.submitting = false)))
      .subscribe(() => {
        this.form.reset({ arn: null, category: null, description: '' });
        this.refresh();
      });
  }
}
