import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AppointmentResponse, CenterResponse, SlotSearchResponse } from '../../../core/models/appointment.model';
import { ApplicationResponse, ServiceScheme } from '../../../core/models/application.model';

@Component({
  selector: 'ps-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  loadingMine = true;
  appointments: AppointmentResponse[] = [];
  columns = ['arn', 'center', 'date', 'time', 'category', 'status', 'actions'];

  applications: ApplicationResponse[] = [];
  centers: CenterResponse[] = [];

  searchForm = this.fb.group({
    arn: [null as string | null, Validators.required],
    centerId: [null as number | null],
    date: [null as Date | null, Validators.required],
    category: ['NORMAL' as ServiceScheme, Validators.required]
  });

  slots: SlotSearchResponse[] = [];
  searching = false;
  booking = false;
  today = new Date();

  rescheduling: AppointmentResponse | null = null;
  rescheduleForm = this.fb.group({
    newAppointmentDate: [null as Date | null, Validators.required],
    newAppointmentTime: ['10:00', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.refreshMine();
    this.applicationService.mine().subscribe((res) => (this.applications = res));
    this.appointmentService.listCenters().subscribe((res) => (this.centers = res));
  }

  refreshMine(): void {
    this.loadingMine = true;
    this.appointmentService.mine()
      .pipe(finalize(() => (this.loadingMine = false)))
      .subscribe((res) => (this.appointments = res));
  }

  search(): void {
    if (!this.searchForm.controls.date.value) return;
    const v = this.searchForm.getRawValue();
    this.searching = true;
    this.slots = [];
    this.appointmentService.searchSlots(this.toIsoDate(v.date!), v.category!, v.centerId ?? undefined)
      .pipe(finalize(() => (this.searching = false)))
      .subscribe((res) => (this.slots = res));
  }

  book(slot: SlotSearchResponse): void {
    const arn = this.searchForm.controls.arn.value;
    const date = this.searchForm.controls.date.value;
    const category = this.searchForm.controls.category.value;
    if (!arn || !date || !category) return;

    const app = this.applications.find((a) => a.arn === arn);
    const isFresh = !app || app.applicationType === 'FRESH';
    const req = {
      arn,
      centerId: slot.centerId,
      appointmentDate: this.toIsoDate(date),
      appointmentTime: '10:00',
      category
    };
    this.booking = true;
    const call = isFresh ? this.appointmentService.bookFresh(req) : this.appointmentService.bookRenewal(req);
    call.pipe(finalize(() => (this.booking = false))).subscribe(() => {
      this.slots = [];
      this.refreshMine();
    });
  }

  startReschedule(appt: AppointmentResponse): void {
    this.rescheduling = appt;
    this.rescheduleForm.reset({ newAppointmentDate: null, newAppointmentTime: '10:00' });
  }

  confirmReschedule(): void {
    if (!this.rescheduling || this.rescheduleForm.invalid) return;
    const v = this.rescheduleForm.getRawValue();
    this.appointmentService.reschedule(this.rescheduling.id, {
      newAppointmentDate: this.toIsoDate(v.newAppointmentDate!),
      newAppointmentTime: v.newAppointmentTime!
    }).subscribe(() => {
      this.rescheduling = null;
      this.refreshMine();
    });
  }

  cancel(appt: AppointmentResponse): void {
    this.appointmentService.cancel(appt.id).subscribe(() => this.refreshMine());
  }

  private toIsoDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
