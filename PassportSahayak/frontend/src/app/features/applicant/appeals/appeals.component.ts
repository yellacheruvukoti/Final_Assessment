import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { GrievanceService } from '../../../core/services/grievance.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AppealAuthorityInfo, AppealResponse } from '../../../core/models/grievance.model';
import { ApplicationResponse } from '../../../core/models/application.model';

@Component({
  selector: 'ps-appeals',
  templateUrl: './appeals.component.html',
  styleUrls: ['./appeals.component.scss']
})
export class AppealsComponent implements OnInit {
  applications: ApplicationResponse[] = [];
  appeals: AppealResponse[] = [];
  authorityChain: AppealAuthorityInfo[] = [];

  loading = false;
  submitting = false;
  showChain = false;
  columns = ['level', 'status', 'ground', 'created'];

  form = this.fb.group({
    arn: [null as string | null, Validators.required],
    groundText: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private fb: FormBuilder,
    private grievanceService: GrievanceService,
    private applicationService: ApplicationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const arnFromQuery = this.route.snapshot.queryParamMap.get('arn');
    this.applicationService.mine().subscribe((res) => {
      this.applications = res;
      if (arnFromQuery) {
        this.form.controls.arn.setValue(arnFromQuery);
        this.loadAppeals(arnFromQuery);
      }
    });
    this.grievanceService.authorityChain().subscribe((res) => (this.authorityChain = res));
  }

  onArnChange(arn: string | null): void {
    if (arn) this.loadAppeals(arn);
    else this.appeals = [];
  }

  loadAppeals(arn: string): void {
    this.loading = true;
    this.grievanceService.appealsForArn(arn)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => (this.appeals = res));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitting = true;
    this.grievanceService.fileAppeal({ arn: v.arn!, groundText: v.groundText! })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe(() => {
        this.form.controls.groundText.reset('');
        this.loadAppeals(v.arn!);
      });
  }
}
