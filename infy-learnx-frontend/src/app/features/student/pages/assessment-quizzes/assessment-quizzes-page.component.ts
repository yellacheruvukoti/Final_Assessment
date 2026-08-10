import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppRoutes } from '../../../../core/constants/app-routes.constants';
import { AssessmentResponse } from '../../../../core/models/assessment.model';
import { AssessmentQuizProgressResponse, QuizAttemptResponse } from '../../../../core/models/quiz-attempt.model';
import { QuizResponse } from '../../../../core/models/quiz.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AssessmentApiService } from '../../services/assessment-api.service';
import { StudentQuizApiService } from '../../services/student-quiz-api.service';

interface QuizRow {
  quiz: QuizResponse;
  attempt: QuizAttemptResponse | null;
}

// Lists the quizzes belonging to an assessment the student is registered
// for (requirement 9), with each quiz's attempt state, plus the overall
// completion/score/certificate-eligibility summary (requirements 10-11)
// computed server-side from real attempt records.
@Component({
  selector: 'app-assessment-quizzes-page',
  templateUrl: './assessment-quizzes-page.component.html',
  styleUrls: ['./assessment-quizzes-page.component.scss'],
})
export class AssessmentQuizzesPageComponent implements OnInit {
  private readonly assessmentId = this.route.snapshot.paramMap.get('assessmentId') ?? '';
  private readonly studentId = this.authService.currentProfileId ?? '';

  assessment: AssessmentResponse | null = null;
  rows: QuizRow[] = [];
  progress: AssessmentQuizProgressResponse | null = null;

  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly assessmentApiService: AssessmentApiService,
    private readonly studentQuizApiService: StudentQuizApiService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Assessment Quizzes | Infy_LearnX');
    this.load();
  }

  quizAttemptRoute(quizId: string): string {
    return '/' + AppRoutes.student.quizAttempt(quizId);
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      assessment: this.assessmentApiService.getAssessmentById(this.assessmentId),
      quizzes: this.studentQuizApiService.getQuizzesForAssessment(this.assessmentId),
      progress: this.studentQuizApiService.getAssessmentProgress(this.assessmentId, this.studentId),
    }).subscribe({
      next: ({ assessment, quizzes, progress }) => {
        this.assessment = assessment;
        this.progress = progress;
        if (quizzes.length === 0) {
          this.rows = [];
          this.isLoading = false;
          return;
        }
        forkJoin(
          quizzes.map((quiz) =>
            this.studentQuizApiService.getMyAttempt(quiz.quizId).pipe(catchError(() => of(null))),
          ),
        ).subscribe((attempts) => {
          this.rows = quizzes.map((quiz, index) => ({ quiz, attempt: attempts[index] }));
          this.isLoading = false;
        });
      },
      error: () => {
        this.errorMessage = 'Unable to load quizzes for this assessment. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
