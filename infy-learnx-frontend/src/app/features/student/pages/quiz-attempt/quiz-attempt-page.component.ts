import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { QuizAnswerRequest, QuizAttemptResponse } from '../../../../core/models/quiz-attempt.model';
import { QuizQuestionResponse } from '../../../../core/models/quiz-question.model';
import { QuizResponse } from '../../../../core/models/quiz.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { StudentQuizApiService } from '../../services/student-quiz-api.service';

interface QuestionOption {
  key: string;
  label: string;
}

interface QuestionView {
  question: QuizQuestionResponse;
  options: QuestionOption[];
  selectedKey: string | null;
}

// The actual quiz-taking experience (requirement 9): renders every question
// and its options dynamically from the real backend data, lets the student
// pick one answer per question, and submits the raw selections — scoring is
// always computed server-side (see learning-service QuizAttemptService),
// never trusted from the client.
@Component({
  selector: 'app-quiz-attempt-page',
  templateUrl: './quiz-attempt-page.component.html',
  styleUrls: ['./quiz-attempt-page.component.scss'],
})
export class QuizAttemptPageComponent implements OnInit {
  private readonly quizId = this.route.snapshot.paramMap.get('quizId') ?? '';

  quiz: QuizResponse | null = null;
  questionViews: QuestionView[] = [];
  result: QuizAttemptResponse | null = null;

  isLoading = true;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly studentQuizApiService: StudentQuizApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Take Quiz | Infy_LearnX');
    this.load();
  }

  get allAnswered(): boolean {
    return this.questionViews.every((view) => view.selectedKey !== null);
  }

  retry(): void {
    this.load();
  }

  selectOption(view: QuestionView, key: string): void {
    view.selectedKey = key;
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    const answers: QuizAnswerRequest[] = this.questionViews.map((view) => ({
      questionId: view.question.questionId,
      selectedKey: view.selectedKey,
    }));

    this.studentQuizApiService.submitAttempt(this.quizId, { answers }).subscribe({
      next: (attempt) => {
        this.isSubmitting = false;
        this.result = attempt;
        this.notificationService.showSuccess('Quiz submitted.');
      },
      error: (error: { message?: string }) => {
        this.isSubmitting = false;
        this.notificationService.showError(error?.message ?? 'Unable to submit this quiz. Please try again.');
      },
    });
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.studentQuizApiService.getMyAttempt(this.quizId).subscribe({
      next: (existingAttempt) => {
        if (existingAttempt) {
          this.result = existingAttempt;
          this.isLoading = false;
          return;
        }
        this.loadQuestions();
      },
      error: () => this.loadQuestions(),
    });
  }

  private loadQuestions(): void {
    this.studentQuizApiService.getQuizQuestions(this.quizId).subscribe({
      next: (questions) => {
        this.questionViews = questions.map((question) => ({
          question,
          options: this.parseOptions(question.optionSet),
          selectedKey: null,
        }));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load this quiz. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private parseOptions(optionSet: string): QuestionOption[] {
    return optionSet
      .split(',')
      .filter((pair) => pair.length > 0)
      .map((pair) => {
        const [key, ...rest] = pair.split(':');
        return { key, label: rest.join(':') };
      });
  }
}
