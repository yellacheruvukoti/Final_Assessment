import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { catchError, forkJoin, map, of } from 'rxjs';

import { CertificateStatus } from '../../../../core/models/certificate.model';
import { RegistrationStatus } from '../../../../core/models/registration.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { CertificateApiService } from '../../services/certificate-api.service';
import { CourseApiService } from '../../services/course-api.service';
import { RegistrationApiService } from '../../services/registration-api.service';

interface CardState {
  isLoading: boolean;
  hasError: boolean;
  value: number | null;
}

interface RecentEnrollment {
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
}

const INITIAL_CARD: CardState = { isLoading: true, hasError: false, value: null };
const RECENT_ENROLLMENTS_LIMIT = 5;

@Component({
  selector: 'app-student-dashboard-page',
  templateUrl: './student-dashboard-page.component.html',
  styleUrls: ['./student-dashboard-page.component.scss'],
})
export class StudentDashboardPageComponent implements OnInit {
  private readonly studentId = this.authService.currentProfileId ?? '';

  enrolledCoursesCard: CardState = { ...INITIAL_CARD };
  upcomingAssessmentsCard: CardState = { ...INITIAL_CARD };
  activeRegistrationsCard: CardState = { ...INITIAL_CARD };
  issuedCertificatesCard: CardState = { ...INITIAL_CARD };

  recentEnrollments: RecentEnrollment[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly assessmentApiService: AssessmentApiService,
    private readonly registrationApiService: RegistrationApiService,
    private readonly certificateApiService: CertificateApiService,
    private readonly courseApiService: CourseApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard | Infy_LearnX');
    this.loadEnrolledCourses();
    this.loadUpcomingAssessments();
    this.loadActiveRegistrations();
    this.loadIssuedCertificates();
  }

  retryEnrolledCourses(): void {
    this.loadEnrolledCourses();
  }

  retryUpcomingAssessments(): void {
    this.loadUpcomingAssessments();
  }

  retryActiveRegistrations(): void {
    this.loadActiveRegistrations();
  }

  retryIssuedCertificates(): void {
    this.loadIssuedCertificates();
  }

  private loadEnrolledCourses(): void {
    this.enrolledCoursesCard = { ...INITIAL_CARD };
    this.recentEnrollments = [];
    this.courseApiService.getEnrollmentsForStudent(this.studentId).subscribe({
      next: (enrollments) => {
        this.enrolledCoursesCard = { isLoading: false, hasError: false, value: enrollments.length };
        const recent = [...enrollments]
          .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
          .slice(0, RECENT_ENROLLMENTS_LIMIT);
        if (recent.length === 0) {
          return;
        }
        forkJoin(
          recent.map((enrollment) =>
            this.courseApiService.getCourseById(enrollment.courseId).pipe(
              map((course) => ({
                courseId: enrollment.courseId,
                courseTitle: course.title,
                enrolledAt: enrollment.enrolledAt,
              })),
              catchError(() =>
                of({
                  courseId: enrollment.courseId,
                  courseTitle: 'Unknown course',
                  enrolledAt: enrollment.enrolledAt,
                }),
              ),
            ),
          ),
        ).subscribe((recentEnrollments) => {
          this.recentEnrollments = recentEnrollments;
        });
      },
      error: () => {
        this.enrolledCoursesCard = { isLoading: false, hasError: true, value: null };
      },
    });
  }

  private loadUpcomingAssessments(): void {
    this.upcomingAssessmentsCard = { ...INITIAL_CARD };
    this.assessmentApiService.getUpcomingAssessments().subscribe({
      next: (result) => {
        this.upcomingAssessmentsCard = { isLoading: false, hasError: false, value: result.data.length };
      },
      error: () => {
        this.upcomingAssessmentsCard = { isLoading: false, hasError: true, value: null };
      },
    });
  }

  private loadActiveRegistrations(): void {
    this.activeRegistrationsCard = { ...INITIAL_CARD };
    this.registrationApiService.getStudentRegistrations(this.studentId).subscribe({
      next: (registrations) => {
        const activeCount = registrations.filter((r) => r.status === RegistrationStatus.REGISTERED).length;
        this.activeRegistrationsCard = { isLoading: false, hasError: false, value: activeCount };
      },
      error: () => {
        this.activeRegistrationsCard = { isLoading: false, hasError: true, value: null };
      },
    });
  }

  private loadIssuedCertificates(): void {
    this.issuedCertificatesCard = { ...INITIAL_CARD };
    this.certificateApiService.getStudentCertificates(this.studentId).subscribe({
      next: (certificates) => {
        const issuedCount = certificates.filter((c) => c.status === CertificateStatus.ISSUED).length;
        this.issuedCertificatesCard = { isLoading: false, hasError: false, value: issuedCount };
      },
      error: () => {
        this.issuedCertificatesCard = { isLoading: false, hasError: true, value: null };
      },
    });
  }
}
