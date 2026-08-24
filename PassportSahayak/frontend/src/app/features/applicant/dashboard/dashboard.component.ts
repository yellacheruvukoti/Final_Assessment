import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { GrievanceService } from '../../../core/services/grievance.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationResponse } from '../../../core/models/application.model';
import { AppointmentResponse } from '../../../core/models/appointment.model';

@Component({
  selector: 'ps-applicant-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  applications: ApplicationResponse[] = [];
  appointments: AppointmentResponse[] = [];
  openGrievances = 0;

  constructor(
    public auth: AuthService,
    private applicationService: ApplicationService,
    private appointmentService: AppointmentService,
    private grievanceService: GrievanceService
  ) {}

  ngOnInit(): void {
    forkJoin({
      applications: this.applicationService.mine(),
      appointments: this.appointmentService.mine(),
      grievances: this.grievanceService.mine()
    }).subscribe({
      next: ({ applications, appointments, grievances }) => {
        this.applications = applications;
        this.appointments = appointments;
        this.openGrievances = grievances.filter((g) => g.status === 'OPEN' || g.status === 'IN_PROGRESS').length;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  get upcomingAppointments(): AppointmentResponse[] {
    return this.appointments.filter((a) => a.status === 'BOOKED' || a.status === 'RESCHEDULED');
  }
}
