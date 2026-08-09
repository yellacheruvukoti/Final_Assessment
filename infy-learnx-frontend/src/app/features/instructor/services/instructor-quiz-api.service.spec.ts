import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { QuizStatus } from '../../../core/models/quiz.model';
import { InstructorQuizApiService } from './instructor-quiz-api.service';

describe('InstructorQuizApiService', () => {
  let service: InstructorQuizApiService;
  let httpMock: HttpTestingController;

  const quizzesBase = `${environment.apiBaseUrl}/quizzes`;
  const coursesBase = `${environment.apiBaseUrl}/courses`;

  const sampleQuiz = {
    quizId: 'q1',
    courseId: 'c1',
    title: 'Quiz 1',
    status: QuizStatus.DRAFT,
    scheduledAt: null,
    durationMinutes: 30,
    totalMarks: 10,
    ownerInstructorId: 'i1',
    createdAt: 't',
    updatedAt: 't',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstructorQuizApiService],
    });
    service = TestBed.inject(InstructorQuizApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getQuizzesByCourse() calls GET /api/courses/{id}/quizzes', () => {
    service.getQuizzesByCourse('c1').subscribe();
    const req = httpMock.expectOne(`${coursesBase}/c1/quizzes`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [sampleQuiz], error: null, meta: null, timestamp: 't' });
  });

  it('getQuizById() calls GET /api/quizzes/{id}', () => {
    service.getQuizById('q1').subscribe();
    const req = httpMock.expectOne(`${quizzesBase}/q1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: sampleQuiz, error: null, meta: null, timestamp: 't' });
  });

  it('getQuizQuestions() calls GET /api/quizzes/{id}/questions', () => {
    service.getQuizQuestions('q1').subscribe();
    const req = httpMock.expectOne(`${quizzesBase}/q1/questions`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [], error: null, meta: null, timestamp: 't' });
  });

  it('createQuiz() POSTs the quiz shell (no embedded questions) to /api/quizzes', () => {
    const request = {
      courseId: 'c1',
      title: 'Quiz 1',
      scheduledAt: null,
      durationMinutes: 30,
      totalMarks: 10,
      ownerInstructorId: 'i1',
    };
    service.createQuiz(request).subscribe();
    const req = httpMock.expectOne(quizzesBase);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect(req.request.body.questions).toBeUndefined();
    req.flush({ success: true, message: 'ok', data: sampleQuiz, error: null, meta: null, timestamp: 't' });
  });

  it('updateQuiz() PUTs to /api/quizzes/{id}', () => {
    service
      .updateQuiz('q1', { title: 'Quiz 1', status: QuizStatus.PUBLISHED, scheduledAt: null, durationMinutes: 30, totalMarks: 10 })
      .subscribe();
    const req = httpMock.expectOne(`${quizzesBase}/q1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, message: 'ok', data: sampleQuiz, error: null, meta: null, timestamp: 't' });
  });

  it('addQuizQuestion() POSTs to /api/quizzes/{id}/questions', () => {
    const question = {
      questionText: 'Which keyword extends a class?',
      questionType: 'MCQ' as never,
      difficultyLevel: 'EASY' as never,
      marks: 1,
      optionSet: 'A:extends,B:implements',
      correctAnswerKey: 'A',
    };
    service.addQuizQuestion('q1', question).subscribe();
    const req = httpMock.expectOne(`${quizzesBase}/q1/questions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(question);
    req.flush({
      success: true,
      message: 'ok',
      data: { questionId: 'qq1', quizId: 'q1', ...question, createdAt: 't', updatedAt: 't' },
      error: null,
      meta: null,
      timestamp: 't',
    });
  });

  it('throws the ApiError when success is false', () => {
    let capturedError: { code: string } | undefined;
    service.getQuizById('missing').subscribe({
      next: () => fail('expected an error'),
      error: (err) => (capturedError = err),
    });
    const req = httpMock.expectOne(`${quizzesBase}/missing`);
    req.flush(
      {
        success: false,
        message: 'Quiz not found.',
        data: null,
        error: { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found.', details: null, correlationId: null },
        meta: null,
        timestamp: 't',
      },
      { status: 404, statusText: 'Not Found' },
    );
    expect(capturedError?.code).toBe('QUIZ_NOT_FOUND');
  });
});
