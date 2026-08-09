export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// data-model.md Section 3.13
export interface LearnerProgressResponse {
  progressId: string;
  studentId: string;
  courseId: string;
  moduleId: string | null;
  completionPercentage: number;
  progressStatus: ProgressStatus;
  lastAccessedAt: string | null;
  updatedAt: string;
}
