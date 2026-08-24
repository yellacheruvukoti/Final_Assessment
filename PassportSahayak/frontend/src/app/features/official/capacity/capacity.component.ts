import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CapacityResponse, CenterResponse } from '../../../core/models/appointment.model';

@Component({
  selector: 'ps-capacity',
  templateUrl: './capacity.component.html',
  styleUrls: ['./capacity.component.scss']
})
export class CapacityComponent implements OnInit {
  centers: CenterResponse[] = [];
  loading = false;
  capacity: CapacityResponse | null = null;
  today = new Date();

  form = this.fb.group({
    centerId: [null as number | null, Validators.required],
    date: [new Date(), Validators.required]
  });

  constructor(private fb: FormBuilder, private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.listCenters().subscribe((res) => (this.centers = res));
  }

  check(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.loading = true;
    this.capacity = null;
    this.appointmentService.capacity(v.centerId!, this.toIsoDate(v.date!))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => (this.capacity = res));
  }

  percent(booked: number, capacity: number): number {
    if (!capacity) return 0;
    return Math.min(100, Math.round((booked / capacity) * 100));
  }

  private toIsoDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
