export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

// data-model.md Section 3.12
export interface QuizQuestionResponse {
  questionId: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel | null;
  marks: number;
  optionSet: string;
  correctAnswerKey: string;
  createdAt: string;
  updatedAt: string;
}
