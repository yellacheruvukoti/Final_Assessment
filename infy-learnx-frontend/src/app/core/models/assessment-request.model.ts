import { AssessmentStatus, ScopeType } from './assessment.model';

// Matches the real assessment-service AssessmentCreateRequest DTO. Note
// this adds `assessmentCode`, which frontend-tasks.md E-02's literal
// description omits but the backend requires.
export interface CreateAssessmentRequest {
  assessmentCode: string;
  title: string;
  description: string | null;
  status: AssessmentStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  scopeType: ScopeType;
  scopeId: string;
}

// Matches the real AssessmentUpdateRequest DTO: scope cannot be changed
// after creation, so scopeType/scopeId are intentionally absent here.
export interface UpdateAssessmentRequest {
  title: string;
  description: string | null;
  status: AssessmentStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}
