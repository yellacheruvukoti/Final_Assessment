import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { CourseResponse } from '../../../../core/models/course.model';
import { AuthService } from '../../../../core/services/auth.service';
import { SummaryCardState } from '../../components/instructor-summary-card/instructor-summary-card.component';
import { InstructorCourseApiService } from '../../services/instructor-course-api.service';
import { InstructorPerformanceApiService } from '../../services/instructor-performance-api.service';
import { InstructorQuizApiService } from '../../services/instructor-quiz-api.service';

const INITIAL_CARD: SummaryCardState = { isLoading: true, hasError: false, value: null };

// Total Courses and Total Learners both come from the same
// GET /api/instructors/{id}/performance call (it is the only endpoint that
// returns an instructor's full owned-course set, including DRAFT/ARCHIVED
// courses that GET /api/courses hides — see CourseManagementPageComponent's
// doc comment). Total Quizzes is derived by summing
// GET /api/courses/{courseId}/quizzes across those same owned course ids.
// All three therefore share one retry path (loadPerformance()); this is a
// real dependency, not a shortcut.
//
// KNOWN BACKEND GAP: "Active Registrations" has no honest data source.
// Registrations are only listable by studentIds (registration-service's
// GET /api/registrations, and even that is an internal, not
// gateway-intended contract) or by batchId (summary-service, requires a
// batchId the instructor has no self-service way to discover). Nothing
// lets an instructor query "registrations for assessments scoped to my
// courses." Rendered as an honest "Not available" card rather than a fake
// count.
@Component({
  selector: 'app-instructor-dashboard-page',
  templateUrl: './instructor-dashboard-page.component.html',
  styleUrls: ['./instructor-dashboard-page.component.scss'],
})
export class InstructorDashboardPageComponent implements OnInit {
  private readonly instructorId = this.authService.currentProfileId ?? '';

  coursesCard: SummaryCardState = { ...INITIAL_CARD };
  quizzesCard: SummaryCardState = { ...INITIAL_CARD };
  learnersCard: SummaryCardState = { ...INITIAL_CARD };
  readonly registrationsCard: SummaryCardState = { isLoading: false, hasError: false, value: null, isUnavailable: true };

  recentCourses: CourseResponse[] = [];
  isLoadingRecent = true;
  recentError: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly instructorPerformanceApiService: InstructorPerformanceApiService,
    private readonly instructorCourseApiService: InstructorCourseApiService,
    private readonly instructorQuizApiService: InstructorQuizApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Instructor Dashboard | Infy_LearnX');
    this.loadPerformance();
  }

  retry(): void {
    this.loadPerformance();
  }

  private loadPerformance(): void {
    this.coursesCard = { ...INITIAL_CARD };
    this.learnersCard = { ...INITIAL_CARD };
    this.quizzesCard = { ...INITIAL_CARD };
    this.isLoadingRecent = true;
    this.recentError = null;

    this.instructorPerformanceApiService.getPerformance(this.instructorId).subscribe({
      next: (performance) => {
        this.coursesCard = { isLoading: false, hasError: false, value: performance.totalCourses };
        this.learnersCard = { isLoading: false, hasError: false, value: performance.totalStudents };

        const courseIds = performance.courses.map((c) => c.courseId);
        this.loadQuizCount(courseIds);
        this.loadRecentCourses(courseIds);
      },
      error: () => {
        this.coursesCard = { isLoading: false, hasError: true, value: null };
        this.learnersCard = { isLoading: false, hasError: true, value: null };
        this.quizzesCard = { isLoading: false, hasError: true, value: null };
        this.isLoadingRecent = false;
        this.recentError = 'Unable to load recent courses. Please try again.';
      },
    });
  }

  private loadQuizCount(courseIds: string[]): void {
    if (courseIds.length === 0) {
      this.quizzesCard = { isLoading: false, hasError: false, value: 0 };
      return;
    }
    forkJoin(courseIds.map((id) => this.instructorQuizApiService.getQuizzesByCourse(id))).subscribe({
      next: (results) => {
        this.quizzesCard = {
          isLoading: false,
          hasError: false,
          value: results.reduce((sum, quizzes) => sum + quizzes.length, 0),
        };
      },
      error: () => {
        this.quizzesCard = { isLoading: false, hasError: true, value: null };
      },
    });
  }

  private loadRecentCourses(courseIds: string[]): void {
    if (courseIds.length === 0) {
      this.recentCourses = [];
      this.isLoadingRecent = false;
      return;
    }
    forkJoin(courseIds.map((id) => this.instructorCourseApiService.getCourseById(id))).subscribe({
      next: (courses) => {
        this.recentCourses = [...courses]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        this.isLoadingRecent = false;
      },
      error: () => {
        this.recentError = 'Unable to load recent courses. Please try again.';
        this.isLoadingRecent = false;
      },
    });
  }
}
