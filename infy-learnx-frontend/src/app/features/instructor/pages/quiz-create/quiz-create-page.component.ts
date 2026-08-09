import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ApiError } from '../../../../core/models/api-response.model';
import { CreateQuizQuestionRequest } from '../../../../core/models/quiz-request.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils/apply-server-errors.util';
import { futureDatetimeValidator } from '../../../../shared/validators/future-datetime.validator';
import { minQuestionCountValidator } from '../../../../shared/validators/min-question-count.validator';
import { positiveIntegerValidator } from '../../../../shared/validators/positive-integer.validator';
import { InstructorQuizApiService } from '../../services/instructor-quiz-api.service';
import { buildQuizQuestionGroup, toQuizQuestionRequest } from '../../utils/quiz-question-form.util';

// The route `instructor/quizzes/new` carries no courseId path segment, so
// QuizManagementPageComponent's "New Quiz" link passes it as a
// `?courseId=` query param instead. See quiz-question-form.util.ts for the
// options/optionSet/correctAnswerKey conversion rationale (verified live
// against real seeded questions).
@Component({
  selector: 'app-quiz-create-page',
  templateUrl: './quiz-create-page.component.html',
  styleUrls: ['./quiz-create-page.component.scss'],
})
export class QuizCreatePageComponent implements OnInit, ComponentWithUnsavedChanges {
  readonly courseId = this.route.snapshot.queryParamMap.get('courseId') ?? '';
  isSubmitting = false;
  formErrors: string[] = [];

  readonly form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    durationMinutes: [null, [Validators.required, positiveIntegerValidator]],
    totalMarks: [null, [Validators.required, positiveIntegerValidator]],
    scheduledAt: ['', futureDatetimeValidator],
    questions: this.formBuilder.array([], minQuestionCountValidator),
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly instructorQuizApiService: InstructorQuizApiService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Create Quiz | Infy_LearnX');
  }

  get questionsArray(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  get questionGroups(): FormGroup[] {
    return this.questionsArray.controls as FormGroup[];
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  onAddQuestion(): void {
    this.questionsArray.push(buildQuizQuestionGroup(this.formBuilder));
    this.questionsArray.markAsDirty();
  }

  onRemoveQuestion(index: number): void {
    this.dialogService
      .confirm({
        title: 'Remove question?',
        bodyMessage: 'Remove this question?',
        confirmLabel: 'Remove',
        cancelLabel: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.questionsArray.removeAt(index);
          this.questionsArray.markAsDirty();
        }
      });
  }

  onSubmit(): void {
    this.formErrors = [];
    if (!this.courseId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const ownerInstructorId = this.authService.currentProfileId ?? '';
    this.isSubmitting = true;
    const { title, durationMinutes, totalMarks, scheduledAt } = this.form.value;

    this.instructorQuizApiService
      .createQuiz({
        courseId: this.courseId,
        title,
        durationMinutes,
        totalMarks,
        scheduledAt: scheduledAt || null,
        ownerInstructorId,
      })
      .pipe(switchMap((quiz) => this.addQuestions(quiz.quizId)))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.form.markAsPristine();
          this.notificationService.showSuccess('Quiz created.');
          this.router.navigate([`/instructor/courses/${this.courseId}/quizzes`]);
        },
        error: (error: ApiError) => {
          this.isSubmitting = false;
          if (error?.details) {
            this.formErrors = applyServerErrors(this.form, error.details);
          } else {
            this.notificationService.showError(error?.message ?? 'Unable to create quiz. Please try again.');
          }
        },
      });
  }

  private addQuestions(quizId: string): Observable<unknown> {
    const requests = this.questionsArray.value.map((q: Record<string, unknown>) => toQuizQuestionRequest(q));
    if (requests.length === 0) {
      return of(null);
    }
    return forkJoin(
      requests.map((req: CreateQuizQuestionRequest) => this.instructorQuizApiService.addQuizQuestion(quizId, req)),
    );
  }
}
