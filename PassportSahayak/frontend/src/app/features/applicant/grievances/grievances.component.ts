import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { GrievanceService } from '../../../core/services/grievance.service';
import { ApplicationService } from '../../../core/services/application.service';
import { GrievanceResponse, GrievanceType, SlaMatrixEntry } from '../../../core/models/grievance.model';
import { ApplicationResponse } from '../../../core/models/application.model';

@Component({
  selector: 'ps-grievances',
  templateUrl: './grievances.component.html',
  styleUrls: ['./grievances.component.scss']
})
export class GrievancesComponent implements OnInit {
  grievanceTypes: { value: GrievanceType; label: string }[] = [
    { value: 'STATUS_DELAY', label: 'Delay in application status update' },
    { value: 'PV_DELAY', label: 'Delay in police verification' },
    { value: 'INCORRECT_REJECTION', label: 'Incorrect rejection' },
    { value: 'PASSPORT_NOT_RECEIVED', label: 'Passport not received' },
    { value: 'STAFF_MISCONDUCT', label: 'Staff misconduct' },
    { value: 'POLICE_PAYMENT_DEMAND', label: 'Police demanding payment' },
    { value: 'DATA_ENTRY_ERROR', label: 'Data entry error' }
  ];

  applications: ApplicationResponse[] = [];
  grievances: GrievanceResponse[] = [];
  slaMatrix: SlaMatrixEntry[] = [];

  loading = true;
  submitting = false;
  showMatrix = false;
  columns = ['type', 'arn', 'status', 'sla', 'created', 'actions'];

  form = this.fb.group({
    arn: [null as string | null],
    type: [null as GrievanceType | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private fb: FormBuilder,
    private grievanceService: GrievanceService,
    private applicationService: ApplicationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const arnFromQuery = this.route.snapshot.queryParamMap.get('arn');
    if (arnFromQuery) {
      this.form.controls.arn.setValue(arnFromQuery);
    }
    this.applicationService.mine().subscribe((res) => (this.applications = res));
    this.grievanceService.slaMatrix().subscribe((res) => (this.slaMatrix = res));
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.grievanceService.mine()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => (this.grievances = res));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitting = true;
    this.grievanceService.file({
      arn: v.arn || null,
      type: v.type!,
      description: v.description!
    }).pipe(finalize(() => (this.submitting = false)))
      .subscribe(() => {
        this.form.reset({ arn: null, type: null, description: '' });
        this.refresh();
      });
  }
}
