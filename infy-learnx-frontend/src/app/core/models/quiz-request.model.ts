import { DifficultyLevel, QuestionType } from './quiz-question.model';
import { QuizStatus } from './quiz.model';

// Matches the real learning-service QuizCreateRequest DTO exactly: creates
// the quiz shell only. No `status` (server-assigned) and no embedded
// questions — questions are added one at a time via the separate
// `POST /api/quizzes/{quizId}/questions` endpoint using
// CreateQuizQuestionRequest below, once the quiz's id is known.
export interface CreateQuizRequest {
  courseId?: string | null;
  assessmentId?: string | null;
  title: string;
  scheduledAt: string | null;
  durationMinutes: number;
  totalMarks: number;
  ownerInstructorId: string;
}

// Matches the real QuizUpdateRequest DTO exactly. No courseId/questions —
// scope and questions are not editable through this endpoint.
export interface UpdateQuizRequest {
  title: string;
  status: QuizStatus;
  scheduledAt: string | null;
  durationMinutes: number;
  totalMarks: number;
}

// Matches the real QuizQuestionCreateRequest DTO, the body for
// `POST /api/quizzes/{quizId}/questions`.
export interface CreateQuizQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel | null;
  marks: number;
  optionSet: string;
  correctAnswerKey: string;
}
