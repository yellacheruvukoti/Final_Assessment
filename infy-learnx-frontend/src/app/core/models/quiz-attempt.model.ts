export interface QuizAnswerRequest {
  questionId: string;
  selectedKey: string | null;
}

export interface QuizSubmissionRequest {
  answers: QuizAnswerRequest[];
}

export interface QuizAttemptResponse {
  attemptId: string;
  quizId: string;
  studentId: string;
  assessmentId: string | null;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  submittedAt: string;
}

export interface AssessmentQuizProgressResponse {
  assessmentId: string;
  studentId: string;
  totalQuizzes: number;
  completedQuizzes: number;
  allQuizzesCompleted: boolean;
  overallScorePercentage: number;
  certificateEligible: boolean;
}
