import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { QuestionType } from '../../../../core/models/quiz-question.model';
import { QuizStatus } from '../../../../core/models/quiz.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InstructorQuizApiService } from '../../services/instructor-quiz-api.service';
import { QuizCreatePageComponent } from './quiz-create-page.component';

describe('QuizCreatePageComponent', () => {
  let component: QuizCreatePageComponent;
  let fixture: ComponentFixture<QuizCreatePageComponent>;
  let instructorQuizApiSpy: jasmine.SpyObj<InstructorQuizApiService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const createdQuiz = {
    quizId: 'q1',
    courseId: 'c1',
    assessmentId: null,
    title: 'New Quiz',
    status: QuizStatus.DRAFT,
    scheduledAt: null,
    durationMinutes: 30,
    totalMarks: 10,
    ownerInstructorId: 'i1',
    createdAt: '2026-08-01T00:00:00',
    updatedAt: '2026-08-01T00:00:00',
  };

  function fillQuizFields(): void {
    component.form.patchValue({ title: 'New Quiz', durationMinutes: 30, totalMarks: 10, scheduledAt: '' });
  }

  function fillQuestion(group: FormGroup): void {
    group.patchValue({ questionText: 'What is 2+2?', questionType: QuestionType.MCQ, marks: 5 });
    const options = group.get('options') as FormArray;
    options.at(0).setValue('Four');
    options.at(1).setValue('Five');
    group.patchValue({ correctAnswerKey: 'Four' });
  }

  beforeEach(() => {
    instructorQuizApiSpy = jasmine.createSpyObj('InstructorQuizApiService', ['createQuiz', 'addQuizQuestion']);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirm']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentProfileId: 'i1' });
    const activatedRouteStub = {
      snapshot: { queryParamMap: { get: (key: string) => (key === 'courseId' ? 'c1' : null) } },
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [QuizCreatePageComponent],
      providers: [
        Title,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: InstructorQuizApiService, useValue: instructorQuizApiSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(QuizCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('reads courseId from the courseId query param', () => {
    expect(component.courseId).toBe('c1');
  });

  it('with zero questions, submission is blocked and no API call is made', () => {
    fillQuizFields();

    component.onSubmit();

    expect(component.questionsArray.invalid).toBe(true);
    expect(instructorQuizApiSpy.createQuiz).not.toHaveBeenCalled();
  });

  it('"Add Question" pushes a new group onto the questions FormArray', () => {
    expect(component.questionsArray.length).toBe(0);
    component.onAddQuestion();
    expect(component.questionsArray.length).toBe(1);
  });

  it('"Remove Question" opens a confirmation dialog; confirming removes the question', () => {
    component.onAddQuestion();
    dialogServiceSpy.confirm.and.returnValue(of(true));

    component.onRemoveQuestion(0);

    expect(dialogServiceSpy.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({ bodyMessage: 'Remove this question?' }),
    );
    expect(component.questionsArray.length).toBe(0);
  });

  it('cancelling the remove-question dialog keeps the question', () => {
    component.onAddQuestion();
    dialogServiceSpy.confirm.and.returnValue(of(false));

    component.onRemoveQuestion(0);

    expect(component.questionsArray.length).toBe(1);
  });

  it('on valid submit, calls createQuiz with quiz-level fields then addQuizQuestion per question', () => {
    fillQuizFields();
    component.onAddQuestion();
    fillQuestion(component.questionGroups[0]);
    instructorQuizApiSpy.createQuiz.and.returnValue(of(createdQuiz));
    instructorQuizApiSpy.addQuizQuestion.and.returnValue(
      of({
        questionId: 'qq1',
        quizId: 'q1',
        questionText: 'What is 2+2?',
        questionType: QuestionType.MCQ,
        difficultyLevel: null,
        marks: 5,
        optionSet: 'A:Four,B:Five',
        correctAnswerKey: 'A',
        createdAt: '2026-08-01T00:00:00',
        updatedAt: '2026-08-01T00:00:00',
      }),
    );

    component.onSubmit();

    expect(instructorQuizApiSpy.createQuiz).toHaveBeenCalledWith({
      courseId: 'c1',
      title: 'New Quiz',
      durationMinutes: 30,
      totalMarks: 10,
      scheduledAt: null,
      ownerInstructorId: 'i1',
    });
    expect(instructorQuizApiSpy.addQuizQuestion).toHaveBeenCalledWith('q1', {
      questionText: 'What is 2+2?',
      questionType: QuestionType.MCQ,
      difficultyLevel: null,
      marks: 5,
      optionSet: 'A:Four,B:Five',
      correctAnswerKey: 'A',
    });
  });

  it('navigates to the course Quiz Management page on success', () => {
    fillQuizFields();
    component.onAddQuestion();
    fillQuestion(component.questionGroups[0]);
    instructorQuizApiSpy.createQuiz.and.returnValue(of(createdQuiz));
    instructorQuizApiSpy.addQuizQuestion.and.returnValue(
      of({
        questionId: 'qq1',
        quizId: 'q1',
        questionText: 'What is 2+2?',
        questionType: QuestionType.MCQ,
        difficultyLevel: null,
        marks: 5,
        optionSet: 'A:Four,B:Five',
        correctAnswerKey: 'A',
        createdAt: '2026-08-01T00:00:00',
        updatedAt: '2026-08-01T00:00:00',
      }),
    );

    component.onSubmit();

    expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith('Quiz created.');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/courses/c1/quizzes']);
  });

  it('shows an error and does not navigate when createQuiz fails without field details', () => {
    fillQuizFields();
    component.onAddQuestion();
    fillQuestion(component.questionGroups[0]);
    instructorQuizApiSpy.createQuiz.and.returnValue(throwError(() => ({ message: 'Server unavailable.' })));

    component.onSubmit();

    expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Server unavailable.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
