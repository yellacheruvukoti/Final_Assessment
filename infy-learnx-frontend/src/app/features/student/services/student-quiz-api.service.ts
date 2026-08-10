import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiRoutes } from '../../../core/constants/api-routes.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AssessmentQuizProgressResponse,
  QuizAttemptResponse,
  QuizSubmissionRequest,
} from '../../../core/models/quiz-attempt.model';
import { QuizQuestionResponse } from '../../../core/models/quiz-question.model';
import { QuizResponse } from '../../../core/models/quiz.model';
import { rethrowApiError, unwrapEnvelope } from '../../../shared/utils/api-response.util';

// Student-facing quiz access + attempt submission (requirements 9-11). The
// question list reuses the existing GET /api/quizzes/{quizId}/questions
// endpoint, which the backend now strips correctAnswerKey from for the
// STUDENT role — this service never sees or trusts a correct answer.
@Injectable({ providedIn: 'root' })
export class StudentQuizApiService {
  constructor(private readonly http: HttpClient) {}

  getQuizzesForAssessment(assessmentId: string): Observable<QuizResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.list}`;
    return this.http
      .get<ApiResponse<QuizResponse[]>>(url, { params: { assessmentId } })
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getQuizQuestions(quizId: string): Observable<QuizQuestionResponse[]> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.questions(quizId)}`;
    return this.http
      .get<ApiResponse<QuizQuestionResponse[]>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getMyAttempt(quizId: string): Observable<QuizAttemptResponse | null> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.myAttempt(quizId)}`;
    return this.http
      .get<ApiResponse<QuizAttemptResponse | null>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  submitAttempt(quizId: string, request: QuizSubmissionRequest): Observable<QuizAttemptResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.attempts(quizId)}`;
    return this.http
      .post<ApiResponse<QuizAttemptResponse>>(url, request)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }

  getAssessmentProgress(assessmentId: string, studentId: string): Observable<AssessmentQuizProgressResponse> {
    const url = `${environment.apiBaseUrl}/${ApiRoutes.quizzes.assessmentProgress(assessmentId, studentId)}`;
    return this.http
      .get<ApiResponse<AssessmentQuizProgressResponse>>(url)
      .pipe(map(unwrapEnvelope), catchError(rethrowApiError));
  }
}
