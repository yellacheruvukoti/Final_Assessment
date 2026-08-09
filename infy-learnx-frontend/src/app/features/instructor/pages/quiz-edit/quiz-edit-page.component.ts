import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { QuizQuestionResponse } from '../../../../core/models/quiz-question.model';
import { QuizStatus } from '../../../../core/models/quiz.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { futureDatetimeValidator } from '../../../../shared/validators/future-datetime.validator';
import { positiveIntegerValidator } from '../../../../shared/validators/positive-integer.validator';
import { InstructorQuizApiService } from '../../services/instructor-quiz-api.service';
import { buildQuizQuestionGroup, resetQuizQuestionGroup, toQuizQuestionRequest } from '../../utils/quiz-question-form.util';

// SHELL upgraded to J-03: quiz-level fields use the real L-01 validators.
// Existing questions (POST .../questions is the ONLY question endpoint —
// no PUT/DELETE exists, confirmed against QuizController source) are
// listed read-only; new questions can still be appended one at a time via
// the same working POST endpoint, reusing QuizCreatePageComponent's
// question-form building blocks (quiz-question-form.util.ts).
@Component({
  selector: 'app-quiz-edit-page',
  templateUrl: './quiz-edit-page.component.html',
  styleUrls: ['./quiz-edit-page.component.scss'],
})
export class QuizEditPageComponent implements OnInit, ComponentWithUnsavedChanges {
  private readonly quizId = this.route.snapshot.paramMap.get('quizId') ?? '';

  isLoading = true;
  loadError: string | null = null;
  isSubmitting = false;
  formErrors: string[] = [];

  existingQuestions: QuizQuestionResponse[] = [];
  isLoadingQuestions = true;
  questionsError: string | null = null;
  isAddingQuestion = false;
  questionFormErrors: string[] = [];

  readonly statusOptions = Object.values(QuizStatus);

  readonly form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    status: ['', Validators.required],
    durationMinutes: [null, [Validators.required, positiveIntegerValidator]],
    totalMarks: [null, [Validators.required, positiveIntegerValidator]],
    scheduledAt: ['', futureDatetimeValidator],
  });

  readonly newQuestionGroup: FormGroup = buildQuizQuestionGroup(this.formBuilder);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly instructorQuizApiService: InstructorQuizApiService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadQuestions();
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty || this.newQuestionGroup.dirty;
  }

  retry(): void {
    this.load();
  }

  retryQuestions(): void {
    this.loadQuestions();
  }

  onSubmit(): void {
    this.formErrors = [];
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const { title, status, durationMinutes, totalMarks, scheduledAt } = this.form.value;
    this.instructorQuizApiService
      .updateQuiz(this.quizId, { title, status, durationMinutes, totalMarks, scheduledAt: scheduledAt || null })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.form.markAsPristine();
          this.notificationService.showSuccess('Quiz updated.');
        },
        error: (error: ApiError) => {
          this.isSubmitting = false;
          if (error?.details) {
            this.formErrors = applyServerErrors(this.form, error.details);
          } else {
            this.notificationService.showError(error?.message ?? 'Unable to update quiz. Please try again.');
          }
        },
      });
  }

  onAddQuestion(): void {
    this.questionFormErrors = [];
    if (this.newQuestionGroup.invalid) {
      this.newQuestionGroup.markAllAsTouched();
      return;
    }
    this.isAddingQuestion = true;
    const request = toQuizQuestionRequest(this.newQuestionGroup.value);
    this.instructorQuizApiService.addQuizQuestion(this.quizId, request).subscribe({
      next: (question) => {
        this.existingQuestions = [...this.existingQuestions, question];
        resetQuizQuestionGroup(this.newQuestionGroup);
        this.isAddingQuestion = false;
        this.notificationService.showSuccess('Question added.');
      },
      error: (error: ApiError) => {
        this.isAddingQuestion = false;
        if (error?.details) {
          this.questionFormErrors = applyServerErrors(this.newQuestionGroup, error.details);
        } else {
          this.notificationService.showError(error?.message ?? 'Unable to add question. Please try again.');
        }
      },
    });
  }

  private load(): void {
    this.isLoading = true;
    this.loadError = null;
    this.instructorQuizApiService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.form.patchValue({
          title: quiz.title,
          status: quiz.status,
          durationMinutes: quiz.durationMinutes,
          totalMarks: quiz.totalMarks,
          scheduledAt: quiz.scheduledAt ?? '',
        });
        this.form.markAsPristine();
        this.isLoading = false;
        this.titleService.setTitle(`Edit ${quiz.title} | Infy_LearnX`);
      },
      error: () => {
        this.loadError = 'Unable to load this quiz. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private loadQuestions(): void {
    this.isLoadingQuestions = true;
    this.questionsError = null;
    this.instructorQuizApiService.getQuizQuestions(this.quizId).subscribe({
      next: (questions) => {
        this.existingQuestions = questions;
        this.isLoadingQuestions = false;
      },
      error: () => {
        this.questionsError = 'Unable to load existing questions. Please try again.';
        this.isLoadingQuestions = false;
      },
    });
  }
}
