import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { QuizQuestionResponse } from '../../../core/models/quiz-question.model';
import {
  CreateQuizQuestionRequest,
  CreateQuizRequest,
  UpdateQuizRequest,
} from '../../../core/models/quiz-request.model';
import { QuizResponse } from '../../../core/models/quiz.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class InstructorQuizApiService {
  constructor(private readonly http: HttpClient) {}

  getQuizzesByCourse(courseId: string): Observable<QuizResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.courses.quizzes(courseId)}`;
    return this.http
      .get<ApiResponse<QuizResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getQuizzesByAssessment(assessmentId: string): Observable<QuizResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.list}`;
    return this.http
      .get<ApiResponse<QuizResponse[]>>(url, { params: { assessmentId } })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getQuizById(quizId: string): Observable<QuizResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.byId(quizId)}`;
    return this.http
      .get<ApiResponse<QuizResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getQuizQuestions(quizId: string): Observable<QuizQuestionResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.questions(quizId)}`;
    return this.http
      .get<ApiResponse<QuizQuestionResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Creates the quiz shell only — matches the real backend design (see
  // core/models/quiz-request.model.ts). Questions are added afterward, one
  // at a time, via addQuizQuestion().
  createQuiz(request: CreateQuizRequest): Observable<QuizResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.create}`;
    return this.http
      .post<ApiResponse<QuizResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  updateQuiz(quizId: string, request: UpdateQuizRequest): Observable<QuizResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.byId(quizId)}`;
    return this.http
      .put<ApiResponse<QuizResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  // Not in frontend-tasks.md F-03's literal 5-method list, but required to
  // actually complete quiz creation given the real backend's
  // shell-then-questions design (see quiz-request.model.ts) — without this,
  // createQuiz() alone can never produce a quiz with any questions.
  addQuizQuestion(quizId: string, request: CreateQuizQuestionRequest): Observable<QuizQuestionResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.questions(quizId)}`;
    return this.http
      .post<ApiResponse<QuizQuestionResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  updateQuizQuestion(
    quizId: string,
    questionId: string,
    request: CreateQuizQuestionRequest,
  ): Observable<QuizQuestionResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.question(quizId, questionId)}`;
    return this.http
      .put<ApiResponse<QuizQuestionResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  deleteQuizQuestion(quizId: string, questionId: string): Observable<void> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.question(quizId, questionId)}`;
    return this.http
      .delete<ApiResponse<void>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
