export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

export enum ScopeType {
  COURSE = 'COURSE',
  BATCH = 'BATCH',
}

// data-model.md Section 3.5
export interface AssessmentResponse {
  assessmentId: string;
  assessmentCode: string;
  title: string;
  description: string | null;
  status: AssessmentStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  scopeType: ScopeType;
  scopeId: string;
  createdAt: string;
  updatedAt: string;
}
