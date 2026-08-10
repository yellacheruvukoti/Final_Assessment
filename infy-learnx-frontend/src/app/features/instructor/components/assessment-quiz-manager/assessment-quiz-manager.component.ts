import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { QuizQuestionResponse } from '../../../../core/models/quiz-question.model';
import { CreateQuizQuestionRequest } from '../../../../core/models/quiz-request.model';
import { QuizResponse } from '../../../../core/models/quiz.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { minQuestionCountValidator } from '../../../../shared/validators/min-question-count.validator';
import { positiveIntegerValidator } from '../../../../shared/validators/positive-integer.validator';
import { InstructorQuizApiService } from '../../services/instructor-quiz-api.service';
import {
  buildQuizQuestionGroup,
  patchQuizQuestionGroup,
  toQuizQuestionRequest,
} from '../../utils/quiz-question-form.util';

// Embeds quiz + question + option management directly into the Assessment
// create/update pages (requirements 6-8): add quizzes to an assessment,
// add/edit/remove their questions and options, on both newly created and
// already-existing assessments — reusing the same Quiz/QuizQuestion
// endpoints, form-building utilities and quiz-question-block component the
// course-scoped instructor quiz pages already use.
@Component({
  selector: 'app-assessment-quiz-manager',
  templateUrl: './assessment-quiz-manager.component.html',
  styleUrls: ['./assessment-quiz-manager.component.scss'],
})
export class AssessmentQuizManagerComponent implements OnChanges {
  @Input({ required: true }) assessmentId!: string;

  quizzes: QuizResponse[] = [];
  isLoading = false;
  loadError: string | null = null;

  showNewQuizForm = false;
  isSubmittingNewQuiz = false;
  readonly newQuizForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    durationMinutes: [null, [Validators.required, positiveIntegerValidator]],
    totalMarks: [null, [Validators.required, positiveIntegerValidator]],
    questions: this.formBuilder.array([], minQuestionCountValidator),
  });

  expandedQuizId: string | null = null;
  questionsByQuiz = new Map<string, QuizQuestionResponse[]>();
  isLoadingQuestions = false;

  addQuestionForms = new Map<string, FormGroup>();
  editingQuestionId: string | null = null;
  editQuestionForm: FormGroup | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly instructorQuizApiService: InstructorQuizApiService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assessmentId'] && this.assessmentId) {
      this.loadQuizzes();
    }
  }

  get newQuizQuestionsArray(): FormArray {
    return this.newQuizForm.get('questions') as FormArray;
  }

  get newQuizQuestionGroups(): FormGroup[] {
    return this.newQuizQuestionsArray.controls as FormGroup[];
  }

  toggleNewQuizForm(): void {
    this.showNewQuizForm = !this.showNewQuizForm;
  }

  onAddNewQuizQuestion(): void {
    this.newQuizQuestionsArray.push(buildQuizQuestionGroup(this.formBuilder));
  }

  onRemoveNewQuizQuestion(index: number): void {
    this.newQuizQuestionsArray.removeAt(index);
  }

  submitNewQuiz(): void {
    if (this.newQuizForm.invalid) {
      this.newQuizForm.markAllAsTouched();
      return;
    }
    const ownerInstructorId = this.authService.currentProfileId ?? '';
    const { title, durationMinutes, totalMarks } = this.newQuizForm.value;
    this.isSubmittingNewQuiz = true;

    this.instructorQuizApiService
      .createQuiz({
        assessmentId: this.assessmentId,
        title,
        durationMinutes,
        totalMarks,
        scheduledAt: null,
        ownerInstructorId,
      })
      .pipe(switchMap((quiz) => this.addQuestions(quiz.quizId)))
      .subscribe({
        next: () => {
          this.isSubmittingNewQuiz = false;
          this.showNewQuizForm = false;
          this.newQuizForm.reset();
          this.newQuizQuestionsArray.clear();
          this.notificationService.showSuccess('Quiz added to this assessment.');
          this.loadQuizzes();
        },
        error: () => {
          this.isSubmittingNewQuiz = false;
          this.notificationService.showError('Unable to add this quiz. Please try again.');
        },
      });
  }

  toggleQuiz(quiz: QuizResponse): void {
    if (this.expandedQuizId === quiz.quizId) {
      this.expandedQuizId = null;
      return;
    }
    this.expandedQuizId = quiz.quizId;
    if (!this.questionsByQuiz.has(quiz.quizId)) {
      this.loadQuestions(quiz.quizId);
    }
    if (!this.addQuestionForms.has(quiz.quizId)) {
      this.addQuestionForms.set(quiz.quizId, buildQuizQuestionGroup(this.formBuilder));
    }
  }

  addQuestionForm(quizId: string): FormGroup {
    return this.addQuestionForms.get(quizId) as FormGroup;
  }

  submitAddQuestion(quizId: string): void {
    const group = this.addQuestionForm(quizId);
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    const request = toQuizQuestionRequest(group.value);
    this.instructorQuizApiService.addQuizQuestion(quizId, request).subscribe({
      next: () => {
        this.notificationService.showSuccess('Question added.');
        this.addQuestionForms.set(quizId, buildQuizQuestionGroup(this.formBuilder));
        this.loadQuestions(quizId);
      },
      error: () => this.notificationService.showError('Unable to add this question. Please try again.'),
    });
  }

  startEditQuestion(question: QuizQuestionResponse): void {
    const group = buildQuizQuestionGroup(this.formBuilder);
    patchQuizQuestionGroup(group, question);
    this.editingQuestionId = question.questionId;
    this.editQuestionForm = group;
  }

  cancelEditQuestion(): void {
    this.editingQuestionId = null;
    this.editQuestionForm = null;
  }

  submitEditQuestion(quizId: string): void {
    if (!this.editQuestionForm || !this.editingQuestionId) {
      return;
    }
    if (this.editQuestionForm.invalid) {
      this.editQuestionForm.markAllAsTouched();
      return;
    }
    const request = toQuizQuestionRequest(this.editQuestionForm.value);
    this.instructorQuizApiService.updateQuizQuestion(quizId, this.editingQuestionId, request).subscribe({
      next: () => {
        this.notificationService.showSuccess('Question updated.');
        this.cancelEditQuestion();
        this.loadQuestions(quizId);
      },
      error: () => this.notificationService.showError('Unable to update this question. Please try again.'),
    });
  }

  removeQuestion(quizId: string, question: QuizQuestionResponse): void {
    this.dialogService
      .confirm({
        title: 'Remove question?',
        bodyMessage: 'Remove this question and its options?',
        confirmLabel: 'Remove',
        cancelLabel: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.instructorQuizApiService.deleteQuizQuestion(quizId, question.questionId).subscribe({
          next: () => {
            this.notificationService.showSuccess('Question removed.');
            this.loadQuestions(quizId);
          },
          error: () => this.notificationService.showError('Unable to remove this question. Please try again.'),
        });
      });
  }

  private addQuestions(quizId: string): Observable<unknown> {
    const requests = this.newQuizQuestionsArray.value.map((q: Record<string, unknown>) => toQuizQuestionRequest(q));
    if (requests.length === 0) {
      return of(null);
    }
    return forkJoin(
      requests.map((req: CreateQuizQuestionRequest) => this.instructorQuizApiService.addQuizQuestion(quizId, req)),
    );
  }

  private loadQuizzes(): void {
    this.isLoading = true;
    this.loadError = null;
    this.instructorQuizApiService.getQuizzesByAssessment(this.assessmentId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Unable to load quizzes for this assessment.';
        this.isLoading = false;
      },
    });
  }

  private loadQuestions(quizId: string): void {
    this.isLoadingQuestions = true;
    this.instructorQuizApiService.getQuizQuestions(quizId).subscribe({
      next: (questions) => {
        this.questionsByQuiz.set(quizId, questions);
        this.isLoadingQuestions = false;
      },
      error: () => {
        this.isLoadingQuestions = false;
        this.notificationService.showError('Unable to load questions for this quiz.');
      },
    });
  }
}
