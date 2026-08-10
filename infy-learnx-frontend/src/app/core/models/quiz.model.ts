export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  LIVE = 'LIVE',
  CLOSED = 'CLOSED',
  EVALUATED = 'EVALUATED',
}

// data-model.md Section 3.11
export interface QuizResponse {
  quizId: string;
  courseId: string | null;
  assessmentId: string | null;
  title: string;
  status: QuizStatus;
  scheduledAt: string | null;
  durationMinutes: number;
  totalMarks: number;
  ownerInstructorId: string;
  createdAt: string;
  updatedAt: string;
}
